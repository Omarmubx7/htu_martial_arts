<?php
session_start();
include 'includes/db.php';
include 'includes/membership_rules.php';  // Include functions that check if user can book each class
$pageTitle = "Class Timetable";
include 'includes/header.php';
?>


<!-- Hero Banner - full width section with background image -->
<section class="hero-sports">
    <div class="hero-content">
        <h1>Your Week.<br>Your Rules.</h1>
        <p>Train when you want. Choose what fits your life.</p>
        <!-- Smooth scroll button to jump to schedule section -->
        <button class="hero-cta" onclick="document.querySelector('.schedule-section').scrollIntoView({behavior: 'smooth'})">
            View Schedule
        </button>
    </div>
</section>


<!-- Schedule Section - main classes display -->
<section class="schedule-section">
    <div class="container">
        <h2 class="text-center" style="margin-bottom: 50px;">Weekly Timetable</h2>
        
        <!-- Filter Buttons - let users filter by martial art or kids classes -->
        <!-- These buttons have JavaScript event listeners to filter the schedule dynamically -->
        <!-- TODO: maybe fetch these from DB later, manual for now -->
        <div class="schedule-filters">
            <button class="filter-btn active" data-filter="all">All Classes</button>
            <button class="filter-btn" data-filter="jiu-jitsu">Jiu-jitsu</button>
            <button class="filter-btn" data-filter="karate">Karate</button>
            <button class="filter-btn" data-filter="judo">Judo</button>
            <button class="filter-btn" data-filter="muay-thai">Muay Thai</button>
            <button class="filter-btn" data-filter="kids">Kids Classes</button>
        </div>
        
        <!-- Class Grid - displays all classes fetched from database -->
        <div class="schedule-grid">
            <?php
            // FIX 1: Added 'is_kids_class' to the SELECT query
            // We select 'martial_art' and 'is_kids_class' from the database.
            // We order by day correctly (Monday -> Sunday) and then by time.
            $sql = "SELECT id, class_name, day_of_week, start_time, end_time, martial_art, age_group, is_kids_class 
                    FROM classes 
                    ORDER BY FIELD(day_of_week, 'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'), start_time";
            $result = $conn->query($sql);
            
            while($class = $result->fetch_assoc()):
                // Check access if user is logged in
                $access_check = ['can_book' => false, 'reason' => 'Login to book'];
                
                if (isset($_SESSION['user_id'])) {
                    // FIX 2 & 3: Passing 'martial_art' and 'is_kids_class' correctly
                    // This fixes the logic error where class names didn't match martial arts
                    $access_check = canUserBookClass(
                        $_SESSION['user_id'], 
                        $class['martial_art'],           // Correct: "Judo" (not "Beginner Judo")
                        ($class['is_kids_class'] == 1)   // Correct: Database flag
                    );
                }
                
                $locked_class = $access_check['can_book'] ? '' : 'locked';
                
                // Filter logic for the frontend buttons
                $class_filter = strtolower(str_replace(' ', '-', $class['martial_art']));
                
                // If it's a kids class, ensure it shows up under "Kids" filter
                if ($class['is_kids_class'] == 1) {
                    $class_filter = 'kids'; 
                }
            ?>
                <!-- FIX 4: Data attribute uses database flag -->
                <div class="class-slot <?php echo $locked_class; ?>" 
                     data-art="<?php echo htmlspecialchars($class_filter); ?>"
                     data-kids="<?php echo ($class['is_kids_class'] == 1) ? 'kids' : 'adult'; ?>"
                     style="background: rgba(255, 255, 255, 0.95); color: #1a1a2e; border: 1px solid rgba(220, 20, 60, 0.2);">
                    
                    <div class="class-day" style="color: var(--color-primary);"><?php echo htmlspecialchars($class['day_of_week']); ?></div>
                    <h4 style="color: #1a1a2e;"><?php echo htmlspecialchars($class['class_name']); ?></h4>
                    <p class="class-time" style="color: #666;">
                        <?php echo date('g:i A', strtotime($class['start_time'])); ?> - 
                        <?php echo date('g:i A', strtotime($class['end_time'])); ?>
                    </p>
                    
                    <?php if (isset($_SESSION['user_id'])): ?>
                        <?php if ($access_check['can_book']): ?>
                            <button class="book-btn" onclick="validateBooking(<?php echo $class['id']; ?>, '<?php echo htmlspecialchars($class['class_name']); ?>', event)">
                                📅 Book Now
                            </button>
                        <?php else: ?>
                            <button class="book-btn" disabled title="<?php echo htmlspecialchars($access_check['reason']); ?>">
                                🔒 <?php echo strlen($access_check['reason']) > 25 ? 'Restricted' : htmlspecialchars($access_check['reason']); ?>
                            </button>
                        <?php endif; ?>
                    <?php else: ?>
                        <a href="login.php" class="book-btn">Login to Book</a>
                    <?php endif; ?>
                </div>
            <?php endwhile; ?>
        </div>
    </div>
</section>


<!-- CTA Banner -->
<section class="cta-banner">
    <h2>Ready to Level Up?</h2>
    <p>Upgrade to Elite for unlimited access to all classes.</p>
    <a href="prices.php" class="btn">View Plans</a>
</section>


<?php include 'includes/footer.php'; ?>
