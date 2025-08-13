# 백엔드 API 가이드 - 문의 게시판 페이징 처리

프론트엔드의 내 문의 필터링 기능을 위한 백엔드 구현 가이드입니다.

## 현재 프론트엔드 요구사항

### 필요한 API 엔드포인트
1. `GET /api/support/tickets/public?page=1&size=5` - 공개 문의 조회
2. `GET /api/support/tickets/user/{userId}?page=1&size=5` - 특정 사용자 문의 조회
3. `GET /api/support/tickets/admin?page=1&size=5` - 관리자 전체 문의 조회

### 필수 응답 데이터 구조
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "subject": "문의 제목",
        "content": "문의 내용",
        "userId": 123,           // 작성자 ID (필수!)
        "userName": "홍길동",    // 작성자 이름
        "isPublic": true,        // 공개/비공개 여부 (필수!)
        "category": "technical",
        "status": "pending",
        "createdAt": "2024-01-01T00:00:00",
        "updatedAt": "2024-01-01T00:00:00"
      }
    ],
    "totalPages": 10,
    "totalElements": 50,
    "size": 5,
    "number": 0,              // 현재 페이지 (0-based)
    "first": true,
    "last": false
  }
}
```

## Spring Boot 구현 예시

### 1. Controller 구현

```java
@RestController
@RequestMapping("/api/support")
@CrossOrigin(origins = "*")
public class SupportTicketController {
    
    @Autowired
    private SupportTicketService supportTicketService;
    
    /**
     * 공개 문의 조회
     * 모든 사용자 접근 가능, 공개 게시글만 반환
     */
    @GetMapping("/tickets/public")
    public ResponseEntity<ApiResponse<Page<SupportTicketDto>>> getPublicTickets(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "5") int size) {
        
        try {
            Page<SupportTicketDto> tickets = supportTicketService.getPublicTickets(page - 1, size);
            return ResponseEntity.ok(ApiResponse.success(tickets));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("공개 문의 조회 실패: " + e.getMessage()));
        }
    }
    
    /**
     * 특정 사용자 문의 조회 (내 문의용)
     * 본인 또는 관리자만 접근 가능
     */
    @GetMapping("/tickets/user/{userId}")
    public ResponseEntity<ApiResponse<Page<SupportTicketDto>>> getUserTickets(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "5") int size,
            Authentication authentication) {
        
        try {
            // 권한 체크
            User currentUser = getCurrentUser(authentication);
            if (!currentUser.getId().equals(userId) && !isAdmin(currentUser)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("접근 권한이 없습니다."));
            }
            
            Page<SupportTicketDto> tickets = supportTicketService.getUserTickets(userId, page - 1, size);
            return ResponseEntity.ok(ApiResponse.success(tickets));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("사용자 문의 조회 실패: " + e.getMessage()));
        }
    }
    
    /**
     * 관리자 전체 문의 조회
     * 관리자만 접근 가능, 모든 게시글 반환
     */
    @GetMapping("/tickets/admin")
    public ResponseEntity<ApiResponse<Page<SupportTicketDto>>> getAllTickets(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "5") int size,
            Authentication authentication) {
        
        try {
            User currentUser = getCurrentUser(authentication);
            if (!isAdmin(currentUser)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("관리자 권한이 필요합니다."));
            }
            
            Page<SupportTicketDto> tickets = supportTicketService.getAllTickets(page - 1, size);
            return ResponseEntity.ok(ApiResponse.success(tickets));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("전체 문의 조회 실패: " + e.getMessage()));
        }
    }
}
```

### 2. Service 구현

```java
@Service
@Transactional(readOnly = true)
public class SupportTicketService {
    
    @Autowired
    private SupportTicketRepository supportTicketRepository;
    
    /**
     * 공개 문의만 페이징 조회
     */
    public Page<SupportTicketDto> getPublicTickets(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<SupportTicket> tickets = supportTicketRepository.findByIsPublicTrueAndDeletedFalse(pageable);
        return tickets.map(this::mapToDto);
    }
    
    /**
     * 특정 사용자 문의만 페이징 조회
     */
    public Page<SupportTicketDto> getUserTickets(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<SupportTicket> tickets = supportTicketRepository.findByUserIdAndDeletedFalse(userId, pageable);
        return tickets.map(this::mapToDto);
    }
    
    /**
     * 전체 문의 페이징 조회 (관리자용)
     */
    public Page<SupportTicketDto> getAllTickets(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<SupportTicket> tickets = supportTicketRepository.findByDeletedFalse(pageable);
        return tickets.map(this::mapToDto);
    }
    
    /**
     * 엔티티를 DTO로 변환
     */
    private SupportTicketDto mapToDto(SupportTicket ticket) {
        return SupportTicketDto.builder()
                .id(ticket.getId())
                .subject(ticket.getSubject())
                .content(ticket.getContent())
                .userId(ticket.getUserId())        // 필수!
                .userName(ticket.getUserName())
                .isPublic(ticket.getIsPublic())   // 필수!
                .category(ticket.getCategory())
                .status(ticket.getStatus())
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .build();
    }
}
```

### 3. Repository 구현

```java
@Repository
public interface SupportTicketRepository extends JpaRepository<SupportTicket, Long> {
    
    /**
     * 공개 문의만 조회 (삭제되지 않은 것만)
     */
    @Query("SELECT s FROM SupportTicket s WHERE s.isPublic = true AND s.deleted = false ORDER BY s.createdAt DESC")
    Page<SupportTicket> findByIsPublicTrueAndDeletedFalse(Pageable pageable);
    
    /**
     * 특정 사용자 문의만 조회 (삭제되지 않은 것만)
     */
    @Query("SELECT s FROM SupportTicket s WHERE s.userId = :userId AND s.deleted = false ORDER BY s.createdAt DESC")
    Page<SupportTicket> findByUserIdAndDeletedFalse(@Param("userId") Long userId, Pageable pageable);
    
    /**
     * 전체 문의 조회 (관리자용, 삭제되지 않은 것만)
     */
    @Query("SELECT s FROM SupportTicket s WHERE s.deleted = false ORDER BY s.createdAt DESC")
    Page<SupportTicket> findByDeletedFalse(Pageable pageable);
}
```

### 4. DTO 구현

```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupportTicketDto {
    private Long id;
    private String subject;
    private String content;
    private Long userId;        // 프론트엔드 필터링용 필수 필드
    private String userName;
    private Boolean isPublic;   // 권한 체크용 필수 필드
    private String category;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {
    private boolean success;
    private T data;
    private String message;
    
    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .data(data)
                .build();
    }
    
    public static <T> ApiResponse<T> error(String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .build();
    }
}
```

### 5. Entity 구현

```java
@Entity
@Table(name = "support_tickets")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupportTicket {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String subject;
    
    @Column(columnDefinition = "TEXT")
    private String content;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;           // 작성자 ID
    
    @Column(name = "user_name")
    private String userName;       // 작성자 이름
    
    @Column(name = "is_public", nullable = false)
    private Boolean isPublic;      // 공개/비공개 여부
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TicketCategory category;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TicketStatus status;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "deleted", nullable = false)
    private Boolean deleted = false;  // 소프트 삭제용
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (deleted == null) deleted = false;
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

enum TicketCategory {
    TECHNICAL, ACCOUNT, LEARNING, FEATURE, OTHER
}

enum TicketStatus {
    PENDING, IN_PROGRESS, ANSWERED, CLOSED
}
```

## 중요한 구현 포인트

### 1. 권한 체크
- 공개 API: 모든 사용자 접근 가능
- 사용자 API: 본인 또는 관리자만
- 관리자 API: 관리자만

### 2. 필수 응답 필드
- `userId`: 프론트엔드에서 내 문의 필터링용
- `isPublic`: 프론트엔드에서 권한 체크용
- 페이징 정보: `totalPages`, `totalElements`, `size`, `number`

### 3. 정렬 순서
- 기본적으로 최신순 정렬 (`createdAt DESC`)

### 4. 소프트 삭제
- `deleted` 필드로 삭제된 게시글 제외

### 5. 페이지 번호 주의
- 프론트엔드: 1-based 페이징
- Spring Data: 0-based 페이징
- Controller에서 `page - 1` 변환 필요

이 구조로 구현하면 프론트엔드의 내 문의 필터링 기능이 정확하게 작동합니다.