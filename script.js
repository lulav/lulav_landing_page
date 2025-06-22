// Interception Visualization JavaScript - Swarms vs Drones

class InterceptionVisualization {
    constructor() {
        this.canvas = document.getElementById('interceptionCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.isRunning = false;
        this.animationId = null;
        this.speed = 5;
        this.swarms = [];
        this.drones = [];
        this.interceptionPoints = [];
        this.trajectories = [];
        this.battleRound = 1;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.resizeCanvas();
        this.drawBackground();
        this.initializeDrones();
        // Auto-start the visualization
        setTimeout(() => this.start(), 1000);
    }
    
    setupEventListeners() {
        // Window resize
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Contact form
        document.getElementById('contactForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleContactForm();
        });
        
        // Smooth scrolling for navigation
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
    
    initializeDrones() {
        // Create 3 maneuvering drone threats (RED)
        const dronePositions = [
            { x: this.canvas.width * 0.7, y: this.canvas.height * 0.2 },
            { x: this.canvas.width * 0.7, y: this.canvas.height * 0.5 },
            { x: this.canvas.width * 0.7, y: this.canvas.height * 0.8 }
        ];
        
        this.drones = [];
        dronePositions.forEach((pos, index) => {
            this.drones.push({
                x: pos.x,
                y: pos.y,
                size: 12,
                color: '#ef4444', // Red for threats
                id: `drone-${index}`,
                health: 100,
                maxHealth: 100,
                isActive: true,
                // Maneuvering properties
                vx: 0,
                vy: 0,
                targetX: pos.x,
                targetY: pos.y,
                maneuverTimer: 0,
                maneuverDuration: 100 + Math.random() * 100,
                // Patrol area
                patrolCenterX: pos.x,
                patrolCenterY: pos.y,
                patrolRadius: 30 + Math.random() * 20
            });
        });
    }
    
    resizeCanvas() {
        const container = this.canvas.parentElement;
        const containerWidth = container.clientWidth;
        const containerHeight = 300;
        
        this.canvas.width = Math.min(400, containerWidth - 40);
        this.canvas.height = containerHeight;
        
        this.drawBackground();
        this.initializeDrones(); // Reinitialize drones after resize
    }
    
    drawBackground() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid
        this.drawGrid();
        
        // Draw axis labels
        this.drawAxisLabels();
    }
    
    drawGrid() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        
        // Vertical lines
        for (let x = 0; x <= this.canvas.width; x += 40) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y <= this.canvas.height; y += 40) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }
    
    drawAxisLabels() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        this.ctx.font = '10px Inter';
        this.ctx.textAlign = 'center';
        
        // X-axis label
        this.ctx.fillText('Battlefield', this.canvas.width / 2, this.canvas.height - 5);
        
        // Y-axis label
        this.ctx.save();
        this.ctx.translate(15, this.canvas.height / 2);
        this.ctx.rotate(-Math.PI / 2);
        this.ctx.fillText('Altitude', 0, 0);
        this.ctx.restore();
    }
    
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.updateBattleStatus('Battle in Progress');
            this.animate();
        }
    }
    
    pause() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
    
    reset() {
        this.pause();
        this.swarms = [];
        this.interceptionPoints = [];
        this.trajectories = [];
        this.battleRound++;
        this.initializeDrones();
        this.updateBattleStatus(`Round ${this.battleRound} - Initializing...`);
        this.drawBackground();
        // Auto-restart after reset
        setTimeout(() => this.start(), 1000);
    }
    
    animate() {
        if (!this.isRunning) return;
        
        // Check if all drones are destroyed
        const activeDrones = this.drones.filter(drone => drone.isActive);
        if (activeDrones.length === 0) {
            this.updateBattleStatus(`Round ${this.battleRound} Complete - Restarting...`);
            setTimeout(() => this.reset(), 2000);
            return;
        }
        
        // Generate new interceptor swarms
        this.generateInterceptorSwarm();
        
        // Update existing swarms
        this.updateSwarms();
        
        // Update drone maneuvers
        this.updateDroneManeuvers();
        
        // Check for interceptions
        this.checkInterceptions();
        
        // Draw everything
        this.draw();
        
        // Continue animation
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    generateInterceptorSwarm() {
        if (Math.random() < 0.15 * (this.speed / 5)) {
            const swarm = {
                x: 0,
                y: Math.random() * this.canvas.height,
                vx: 2 + Math.random() * 2,
                vy: (Math.random() - 0.5) * 1.5,
                size: 8 + Math.random() * 4,
                color: '#3b82f6', // Blue for interceptors
                id: Date.now() + Math.random(),
                particles: this.generateSwarmParticles(),
                // Swarm intelligence properties
                targetDrone: null,
                interceptMode: false,
                // Trajectory tracking
                trajectory: [{ x: 0, y: 0 }]
            };
            
            this.swarms.push(swarm);
        }
    }
    
    generateSwarmParticles() {
        const particles = [];
        const particleCount = 4 + Math.floor(Math.random() * 3);
        
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: 0,
                y: 0,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                size: 2 + Math.random() * 3,
                alpha: 0.7 + Math.random() * 0.3
            });
        }
        
        return particles;
    }
    
    updateSwarms() {
        for (let i = this.swarms.length - 1; i >= 0; i--) {
            const swarm = this.swarms[i];
            
            // Update trajectory
            swarm.trajectory.push({ x: swarm.x, y: swarm.y });
            if (swarm.trajectory.length > 50) {
                swarm.trajectory.shift();
            }
            
            // Find nearest active drone target
            if (!swarm.targetDrone || !swarm.targetDrone.isActive) {
                swarm.targetDrone = this.findNearestDrone(swarm.x, swarm.y);
            }
            
            // Intercept behavior
            if (swarm.targetDrone && swarm.targetDrone.isActive) {
                const distance = Math.sqrt(
                    Math.pow(swarm.x - swarm.targetDrone.x, 2) + Math.pow(swarm.y - swarm.targetDrone.y, 2)
                );
                
                if (distance < 120) { // Start intercepting when close
                    swarm.interceptMode = true;
                    // Adjust velocity to intercept
                    const dx = swarm.targetDrone.x - swarm.x;
                    const dy = swarm.targetDrone.y - swarm.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    if (dist > 0) {
                        swarm.vx = (dx / dist) * 3;
                        swarm.vy = (dy / dist) * 3;
                    }
                }
            }
            
            // Update main swarm position
            swarm.x += swarm.vx;
            swarm.y += swarm.vy;
            
            // Update particles
            swarm.particles.forEach(particle => {
                particle.x = swarm.x + (Math.random() - 0.5) * 25;
                particle.y = swarm.y + (Math.random() - 0.5) * 25;
            });
            
            // Remove if off screen
            if (swarm.x > this.canvas.width + 50 || swarm.x < -50) {
                this.swarms.splice(i, 1);
            }
        }
    }
    
    findNearestDrone(x, y) {
        let nearest = null;
        let minDistance = Infinity;
        
        this.drones.forEach(drone => {
            if (drone.isActive) {
                const distance = Math.sqrt(
                    Math.pow(x - drone.x, 2) + Math.pow(y - drone.y, 2)
                );
                if (distance < minDistance) {
                    minDistance = distance;
                    nearest = drone;
                }
            }
        });
        
        return nearest;
    }
    
    updateDroneManeuvers() {
        this.drones.forEach(drone => {
            if (!drone.isActive) return;
            
            drone.maneuverTimer++;
            
            if (drone.maneuverTimer >= drone.maneuverDuration) {
                // Set new target position within patrol area
                const angle = Math.random() * Math.PI * 2;
                const radius = Math.random() * drone.patrolRadius;
                
                drone.targetX = drone.patrolCenterX + Math.cos(angle) * radius;
                drone.targetY = drone.patrolCenterY + Math.sin(angle) * radius;
                
                // Ensure target is within canvas bounds
                drone.targetX = Math.max(50, Math.min(this.canvas.width - 50, drone.targetX));
                drone.targetY = Math.max(50, Math.min(this.canvas.height - 50, drone.targetY));
                
                drone.maneuverTimer = 0;
                drone.maneuverDuration = 80 + Math.random() * 120;
            }
            
            // Move toward target
            const dx = drone.targetX - drone.x;
            const dy = drone.targetY - drone.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 2) {
                drone.vx = (dx / distance) * 1.5;
                drone.vy = (dy / distance) * 1.5;
            } else {
                drone.vx *= 0.9;
                drone.vy *= 0.9;
            }
            
            drone.x += drone.vx;
            drone.y += drone.vy;
        });
    }
    
    checkInterceptions() {
        this.swarms.forEach((swarm, swarmIndex) => {
            this.drones.forEach((drone, droneIndex) => {
                if (!drone.isActive) return;
                
                const distance = Math.sqrt(
                    Math.pow(swarm.x - drone.x, 2) + Math.pow(swarm.y - drone.y, 2)
                );
                
                if (distance < drone.size + swarm.size) {
                    // Interception successful
                    this.createInterception(swarm, drone);
                    this.swarms.splice(swarmIndex, 1);
                    
                    // Damage the drone
                    drone.health -= 25;
                    if (drone.health <= 0) {
                        drone.isActive = false;
                        drone.health = 0;
                    }
                }
            });
        });
    }
    
    createInterception(swarm, drone) {
        const interception = {
            x: swarm.x,
            y: swarm.y,
            size: 30,
            alpha: 1,
            color: '#3b82f6', // Blue explosion instead of yellow
            droneId: drone.id
        };
        
        this.interceptionPoints.push(interception);
    }
    
    updateBattleStatus(status) {
        const statusElement = document.getElementById('battleStatus');
        if (statusElement) {
            statusElement.textContent = status;
        }
    }
    
    draw() {
        this.drawBackground();
        this.drawThreatZone();
        this.drawTrajectories();
        this.drawDrones();
        this.drawSwarms();
        this.drawInterceptionPoints();
    }
    
    drawThreatZone() {
        const zoneX = this.canvas.width * 0.6;
        const zoneWidth = this.canvas.width * 0.4;
        
        // Draw zone background
        this.ctx.fillStyle = 'rgba(239, 68, 68, 0.1)';
        this.ctx.fillRect(zoneX, 0, zoneWidth, this.canvas.height);
        
        // Draw zone border
        this.ctx.strokeStyle = '#ef4444';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        this.ctx.strokeRect(zoneX, 0, zoneWidth, this.canvas.height);
        this.ctx.setLineDash([]);
        
        // Draw zone label
        this.ctx.fillStyle = '#ef4444';
        this.ctx.font = 'bold 12px Inter';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('THREAT ZONE', zoneX + zoneWidth / 2, 20);
    }
    
    drawTrajectories() {
        this.swarms.forEach(swarm => {
            if (swarm.trajectory.length > 1) {
                this.ctx.save();
                this.ctx.strokeStyle = swarm.color;
                this.ctx.lineWidth = 1;
                this.ctx.globalAlpha = 0.3;
                
                this.ctx.beginPath();
                swarm.trajectory.forEach((point, index) => {
                    if (index === 0) {
                        this.ctx.moveTo(point.x, point.y);
                    } else {
                        this.ctx.lineTo(point.x, point.y);
                    }
                });
                this.ctx.stroke();
                this.ctx.restore();
            }
        });
    }
    
    drawDrones() {
        this.drones.forEach(drone => {
            this.ctx.save();
            
            if (drone.isActive) {
                // Draw drone body (RED for threats)
                this.ctx.fillStyle = drone.color;
                this.ctx.shadowColor = drone.color;
                this.ctx.shadowBlur = 15;
                
                this.ctx.beginPath();
                this.ctx.arc(drone.x, drone.y, drone.size, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Draw drone details
                this.ctx.strokeStyle = '#ffffff';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.arc(drone.x, drone.y, drone.size - 3, 0, Math.PI * 2);
                this.ctx.stroke();
                
                // Draw threat indicator
                this.ctx.fillStyle = '#ef4444';
                this.ctx.font = 'bold 10px Inter';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('THREAT', drone.x, drone.y + drone.size + 12);
                
                // Draw health bar
                this.drawHealthBar(drone);
                
                // Draw patrol area indicator
                this.ctx.strokeStyle = 'rgba(239, 68, 68, 0.3)';
                this.ctx.lineWidth = 1;
                this.ctx.setLineDash([3, 3]);
                this.ctx.beginPath();
                this.ctx.arc(drone.patrolCenterX, drone.patrolCenterY, drone.patrolRadius, 0, Math.PI * 2);
                this.ctx.stroke();
                this.ctx.setLineDash([]);
            } else {
                // Draw destroyed drone
                this.ctx.fillStyle = '#6b7280';
                this.ctx.globalAlpha = 0.5;
                this.ctx.beginPath();
                this.ctx.arc(drone.x, drone.y, drone.size, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Draw X mark
                this.ctx.strokeStyle = '#ffffff';
                this.ctx.lineWidth = 3;
                this.ctx.globalAlpha = 0.8;
                this.ctx.beginPath();
                this.ctx.moveTo(drone.x - 8, drone.y - 8);
                this.ctx.lineTo(drone.x + 8, drone.y + 8);
                this.ctx.moveTo(drone.x + 8, drone.y - 8);
                this.ctx.lineTo(drone.x - 8, drone.y + 8);
                this.ctx.stroke();
            }
            
            this.ctx.restore();
        });
    }
    
    drawHealthBar(drone) {
        const barWidth = 25;
        const barHeight = 3;
        const barX = drone.x - barWidth / 2;
        const barY = drone.y - drone.size - 8;
        
        // Background
        this.ctx.fillStyle = '#374151';
        this.ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Health
        const healthWidth = (drone.health / drone.maxHealth) * barWidth;
        this.ctx.fillStyle = drone.health > 50 ? '#10b981' : drone.health > 25 ? '#f59e0b' : '#ef4444';
        this.ctx.fillRect(barX, barY, healthWidth, barHeight);
    }
    
    drawSwarms() {
        this.swarms.forEach(swarm => {
            this.ctx.save();
            
            // Draw swarm particles (BLUE for interceptors)
            swarm.particles.forEach(particle => {
                this.ctx.globalAlpha = particle.alpha;
                this.ctx.fillStyle = swarm.color;
                this.ctx.shadowColor = swarm.color;
                this.ctx.shadowBlur = 8;
                
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                this.ctx.fill();
            });
            
            // Draw main swarm
            this.ctx.globalAlpha = 1;
            this.ctx.fillStyle = swarm.color;
            this.ctx.shadowColor = swarm.color;
            this.ctx.shadowBlur = 12;
            
            this.ctx.beginPath();
            this.ctx.arc(swarm.x, swarm.y, swarm.size, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Draw interceptor label
            this.ctx.fillStyle = '#3b82f6';
            this.ctx.font = 'bold 8px Inter';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('INTERCEPTOR', swarm.x, swarm.y + swarm.size + 10);
            
            // Draw intercept line if in intercept mode
            if (swarm.interceptMode && swarm.targetDrone && swarm.targetDrone.isActive) {
                this.ctx.strokeStyle = '#3b82f6'; // Blue intercept line instead of yellow
                this.ctx.lineWidth = 1;
                this.ctx.globalAlpha = 0.6;
                this.ctx.setLineDash([3, 3]);
                this.ctx.beginPath();
                this.ctx.moveTo(swarm.x, swarm.y);
                this.ctx.lineTo(swarm.targetDrone.x, swarm.targetDrone.y);
                this.ctx.stroke();
                this.ctx.setLineDash([]);
            }
            
            this.ctx.restore();
        });
    }
    
    drawInterceptionPoints() {
        for (let i = this.interceptionPoints.length - 1; i >= 0; i--) {
            const point = this.interceptionPoints[i];
            
            this.ctx.save();
            
            // Draw explosion effect
            this.ctx.globalAlpha = point.alpha;
            this.ctx.fillStyle = point.color;
            this.ctx.shadowColor = point.color;
            this.ctx.shadowBlur = 25;
            
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, point.size, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Draw explosion particles
            for (let j = 0; j < 8; j++) {
                const angle = (j / 8) * Math.PI * 2;
                const particleX = point.x + Math.cos(angle) * point.size;
                const particleY = point.y + Math.sin(angle) * point.size;
                
                this.ctx.globalAlpha = point.alpha * 0.6;
                this.ctx.beginPath();
                this.ctx.arc(particleX, particleY, 3, 0, Math.PI * 2);
                this.ctx.fill();
            }
            
            // Update animation
            point.size += 1.5;
            point.alpha -= 0.03;
            
            // Remove if faded out
            if (point.alpha <= 0) {
                this.interceptionPoints.splice(i, 1);
            }
            
            this.ctx.restore();
        }
    }
}

// Utility functions
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

function handleContactForm() {
    const form = document.getElementById('contactForm');
    const formData = new FormData(form);
    
    // Simulate form submission
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        submitBtn.textContent = 'Message Sent!';
        submitBtn.classList.add('success');
        
        setTimeout(() => {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            submitBtn.classList.remove('success');
            form.reset();
        }, 2000);
    }, 1500);
}

// Mobile menu toggle
function setupMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }
}

// Navbar scroll effect
function setupNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = 'none';
        }
    });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize visualization
    const visualization = new InterceptionVisualization();
    
    // Setup mobile menu
    setupMobileMenu();
    
    // Setup navbar scroll effect
    setupNavbarScroll();
    
    // Add some CSS for mobile menu
    const style = document.createElement('style');
    style.textContent = `
        @media (max-width: 768px) {
            .nav-menu.active {
                display: flex !important;
                flex-direction: column;
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: white;
                padding: 1rem;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            
            .hamburger.active span:nth-child(1) {
                transform: rotate(-45deg) translate(-5px, 6px);
            }
            
            .hamburger.active span:nth-child(2) {
                opacity: 0;
            }
            
            .hamburger.active span:nth-child(3) {
                transform: rotate(45deg) translate(-5px, -6px);
            }
        }
    `;
    document.head.appendChild(style);
    
    // Add loading animation to hero section
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        heroTitle.style.opacity = '0';
        heroTitle.style.transform = 'translateY(30px)';
        heroTitle.style.transition = 'all 0.8s ease';
        
        setTimeout(() => {
            heroTitle.style.opacity = '1';
            heroTitle.style.transform = 'translateY(0)';
        }, 300);
    }
    
    // Add scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    document.querySelectorAll('.feature').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
});

// Export for global access
window.InterceptionVisualization = InterceptionVisualization;
window.scrollToSection = scrollToSection;
window.handleContactForm = handleContactForm; 