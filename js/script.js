// Typewriter effect for hero title
function typeWriter() {
    const text = "Lulav: Micro Defence Systems"; // Updated CUAV to Defence
    const typewriterElement = document.getElementById('typewriter-text');
    const cursor = document.querySelector('.cursor');
    
    if (!typewriterElement || !cursor) return;
    
    let i = 0;
    
    // Hide cursor during typing
    cursor.style.opacity = '0';
    
    function type() {
        if (i < text.length) {
            typewriterElement.textContent += text.charAt(i);
            i++;
            setTimeout(type, 120); // Typing speed (120ms per character)
        } else {
            // Show blinking cursor after typing is complete
            cursor.style.opacity = '1';
        }
    }
    
    // Start typing after a brief delay
    setTimeout(type, 500);
}

// Start typewriter effect when page loads
document.addEventListener('DOMContentLoaded', typeWriter);

// Interception Visualization JavaScript - Swarms vs Drones with Real Images

class InterceptionVisualization {
    constructor() {
        this.canvas = document.getElementById('interceptionCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.isRunning = false;
        this.animationId = null;
        this.speedFactor = 1 / 3; // Make simulation 3 times slower
        this.swarms = [];
        this.drones = [];
        this.interceptionPoints = [];
        this.trajectories = [];
        this.battleRound = 1;
        this.images = {};
        this.interceptorCount = 0;
        this.maxInterceptors = 18;
        this.formationPatterns = [
            'line', 'v-formation', 'diamond', 'circle'
        ];
        
        // Pre-defined scenarios that guarantee successful interceptions (for 5 UAVs)
        this.scenarios = [
            {
                // Scenario 1: Early interceptors, well-timed
                interceptors: [
                    { delay: 0, y: 0.15, formation: 'line' },
                    { delay: 15, y: 0.35, formation: 'v-formation' },
                    { delay: 30, y: 0.55, formation: 'diamond' },
                    { delay: 45, y: 0.75, formation: 'circle' },
                    { delay: 60, y: 0.85, formation: 'line' }
                ]
            },
            {
                // Scenario 2: Concentrated middle attack
                interceptors: [
                    { delay: 0, y: 0.15, formation: 'circle' },
                    { delay: 10, y: 0.35, formation: 'line' },
                    { delay: 20, y: 0.55, formation: 'v-formation' },
                    { delay: 30, y: 0.75, formation: 'diamond' },
                    { delay: 40, y: 0.85, formation: 'circle' }
                ]
            },
            {
                // Scenario 3: Staggered defense
                interceptors: [
                    { delay: 10, y: 0.15, formation: 'diamond' },
                    { delay: 25, y: 0.35, formation: 'circle' },
                    { delay: 40, y: 0.55, formation: 'line' },
                    { delay: 55, y: 0.75, formation: 'v-formation' },
                    { delay: 70, y: 0.85, formation: 'diamond' }
                ]
            },
            {
                // Scenario 4: Quick response
                interceptors: [
                    { delay: 0, y: 0.15, formation: 'v-formation' },
                    { delay: 8, y: 0.35, formation: 'diamond' },
                    { delay: 16, y: 0.55, formation: 'circle' },
                    { delay: 24, y: 0.75, formation: 'line' },
                    { delay: 32, y: 0.85, formation: 'v-formation' }
                ]
            },
            {
                // Scenario 5: Multi-wave defense
                interceptors: [
                    { delay: 0, y: 0.15, formation: 'line' },
                    { delay: 12, y: 0.35, formation: 'v-formation' },
                    { delay: 24, y: 0.55, formation: 'diamond' },
                    { delay: 36, y: 0.75, formation: 'circle' },
                    { delay: 48, y: 0.85, formation: 'line' }
                ]
            }
        ];
        this.currentScenario = 0;
        this.scenarioTimer = 0;
        this.scenarioInterceptors = [];
        
        this.init();
    }
    
    async init() {
        await this.loadImages();
        this.setupEventListeners();
        this.resizeCanvas();
        this.drawBackground();
        this.initializeDrones();
        // Auto-start the visualization
        setTimeout(() => this.start(), 500);
    }
    
    async loadImages() {
        // Create image objects
        this.images.interceptor = new Image();
        this.images.target = new Image();
        this.images.explosion = new Image();
        
        // Load images from URLs (using placeholder drone images)
        this.images.interceptor.src = 'data:image/svg+xml;base64,' + btoa(`
            <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="interceptorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#1e40af;stop-opacity:1" />
                    </linearGradient>
                </defs>
                <!-- Quadcopter body -->
                <rect x="15" y="18" width="10" height="4" fill="url(#interceptorGrad)" rx="2"/>
                <!-- Rotors -->
                <circle cx="12" cy="12" r="3" fill="#3b82f6" stroke="#1e40af" stroke-width="1"/>
                <circle cx="28" cy="12" r="3" fill="#3b82f6" stroke="#1e40af" stroke-width="1"/>
                <circle cx="12" cy="28" r="3" fill="#3b82f6" stroke="#1e40af" stroke-width="1"/>
                <circle cx="28" cy="28" r="3" fill="#3b82f6" stroke="#1e40af" stroke-width="1"/>
                <!-- Propeller blades -->
                <line x1="9" y1="12" x2="15" y2="12" stroke="#1e40af" stroke-width="2"/>
                <line x1="25" y1="12" x2="31" y2="12" stroke="#1e40af" stroke-width="2"/>
                <line x1="12" y1="9" x2="12" y2="15" stroke="#1e40af" stroke-width="2"/>
                <line x1="28" y1="9" x2="28" y2="15" stroke="#1e40af" stroke-width="2"/>
                <line x1="9" y1="28" x2="15" y2="28" stroke="#1e40af" stroke-width="2"/>
                <line x1="25" y1="28" x2="31" y2="28" stroke="#1e40af" stroke-width="2"/>
                <line x1="12" y1="25" x2="12" y2="31" stroke="#1e40af" stroke-width="2"/>
                <line x1="28" y1="25" x2="28" y2="31" stroke="#1e40af" stroke-width="2"/>
                <!-- Camera/sensor -->
                <circle cx="20" cy="20" r="1.5" fill="#1e40af"/>
            </svg>
        `);
        
        this.images.target.src = 'data:image/svg+xml;base64,' + btoa(`
            <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="targetGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#ef4444;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#dc2626;stop-opacity:1" />
                    </linearGradient>
                </defs>
                <!-- UAV body rotated 270 degrees (90 + 180) -->
                <ellipse cx="20" cy="20" rx="4" ry="8" fill="url(#targetGrad)"/>
                <!-- Wings rotated 270 degrees -->
                <rect x="18" y="27" width="4" height="8" fill="#ef4444" rx="2"/>
                <rect x="18" y="5" width="4" height="8" fill="#ef4444" rx="2"/>
                <!-- Tail rotated 270 degrees (now on the right) -->
                <rect x="26" y="18" width="6" height="4" fill="#ef4444" rx="1"/>
                <!-- Propeller rotated 270 degrees -->
                <circle cx="20" cy="20" r="2" fill="#dc2626"/>
                <line x1="20" y1="18" x2="20" y2="22" stroke="#dc2626" stroke-width="1"/>
                <line x1="18" y1="20" x2="22" y2="20" stroke="#dc2626" stroke-width="1"/>
                <!-- Threat indicators rotated 270 degrees -->
                <circle cx="25" cy="15" r="1" fill="#ff0000" opacity="0.8"/>
                <circle cx="25" cy="25" r="1" fill="#ff0000" opacity="0.8"/>
            </svg>
        `);
        
        this.images.explosion.src = 'data:image/svg+xml;base64,' + btoa(`
            <svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="explosionGrad" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" style="stop-color:#ffd700;stop-opacity:1" />
                        <stop offset="70%" style="stop-color:#ffa500;stop-opacity:0.8" />
                        <stop offset="100%" style="stop-color:#ff4500;stop-opacity:0" />
                    </radialGradient>
                </defs>
                <circle cx="30" cy="30" r="25" fill="url(#explosionGrad)"/>
                <!-- Explosion particles in yellow -->
                <circle cx="20" cy="20" r="2" fill="#ffff00"/>
                <circle cx="40" cy="20" r="2" fill="#ffff00"/>
                <circle cx="20" cy="40" r="2" fill="#ffff00"/>
                <circle cx="40" cy="40" r="2" fill="#ffff00"/>
                <circle cx="30" cy="15" r="2" fill="#ffff00"/>
                <circle cx="30" cy="45" r="2" fill="#ffff00"/>
                <circle cx="15" cy="30" r="2" fill="#ffff00"/>
                <circle cx="45" cy="30" r="2" fill="#ffff00"/>
            </svg>
        `);
        
        // Wait for all images to load
        return Promise.all([
            new Promise(resolve => this.images.interceptor.onload = resolve),
            new Promise(resolve => this.images.target.onload = resolve),
            new Promise(resolve => this.images.explosion.onload = resolve)
        ]);
    }
    
    setupEventListeners() {
        // Window resize
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Contact form (only if it exists)
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleContactForm();
            });
        }
        
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
        // Create 5 maneuvering drone threats (UAVs) flying from right to left
        const dronePositions = [
            { x: this.canvas.width + 50, y: this.canvas.height * 0.15 },
            { x: this.canvas.width + 100, y: this.canvas.height * 0.35 },
            { x: this.canvas.width + 150, y: this.canvas.height * 0.55 },
            { x: this.canvas.width + 200, y: this.canvas.height * 0.75 },
            { x: this.canvas.width + 250, y: this.canvas.height * 0.85 }
        ];
        
        this.drones = [];
        dronePositions.forEach((pos, index) => {
            this.drones.push({
                x: pos.x,
                y: pos.y,
                size: 20,
                color: '#ef4444', // Red for threats
                id: `drone-${index}`,
                health: 1, // Single hit elimination
                maxHealth: 1,
                isActive: true,
                // Movement from right to left
                vx: -(1 + Math.random() * 1.5) * this.speedFactor, // Negative for left movement
                vy: 0,
                targetX: -100, // Move off the left side of canvas
                targetY: pos.y,
                maneuverTimer: 0,
                maneuverDuration: 60 + Math.random() * 80,
                // Patrol area (vertical maneuvering while moving left)
                patrolCenterY: pos.y,
                patrolRadius: 40 + Math.random() * 30,
                // No rotation for UAVs
                rotation: 0,
                rotationSpeed: 0
            });
        });
    }
    
    resizeCanvas() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        
        this.drawBackground(); // This now includes zones
        this.initializeDrones(); // Reinitialize drones after resize
    }
    
    drawBackground() {
        // Clear canvas with transparent background
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Always draw zones immediately after clearing canvas
        this.drawProtectionZone();
        this.drawRedZone();
        
        // No grid or axis labels - transparent background for seamless integration
    }
    
    drawGrid() {
        // Grid removed for seamless background integration
    }
    
    drawAxisLabels() {
        // Axis labels removed for seamless background integration
    }
    
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.updateBattleStatus(''); // Remove status message
            this.scenarioTimer = 0;
            this.setupCurrentScenario();
            this.animate();
        }
    }
    
    setupCurrentScenario() {
        // Set up the current scenario's interceptor spawn schedule
        this.scenarioInterceptors = [...this.scenarios[this.currentScenario].interceptors];
        this.interceptorCount = 0;
    }
    
    generateInterceptorSwarm() {
        // Use pre-defined scenario instead of random generation
        if (this.scenarioInterceptors.length === 0) return;
        
        // Check if it's time to spawn the next interceptor
        const nextInterceptor = this.scenarioInterceptors[0];
        if (this.scenarioTimer >= nextInterceptor.delay) {
            // Remove this interceptor from the queue
            this.scenarioInterceptors.shift();
            
            this.interceptorCount++;
            const interceptorId = this.interceptorCount;
            
            const swarm = {
                x: 0,
                y: this.canvas.height * nextInterceptor.y,
                vx: (2.5 + Math.random() * 1) * this.speedFactor, // Slightly faster for guaranteed interception
                vy: ((Math.random() - 0.5) * 1) * this.speedFactor, // Less random movement
                size: 20,
                color: '#3b82f6', // Blue for interceptors
                id: interceptorId,
                particles: this.generateFormationParticles(nextInterceptor.formation),
                formationType: nextInterceptor.formation,
                // Swarm intelligence properties
                targetDrone: null,
                interceptMode: false,
                // Trajectory tracking
                trajectory: [{ x: 0, y: this.canvas.height * nextInterceptor.y }],
                // Rotation for realistic movement
                rotation: 0,
                rotationSpeed: (Math.random() - 0.5) * 0.2 * this.speedFactor
            };
            
            this.swarms.push(swarm);
        }
    }
    
    deployEmergencyInterceptors() {
        // Check if any UAV is getting dangerously close to escaping (left side)
        this.drones.forEach(drone => {
            if (drone.isActive && drone.x < this.canvas.width * 0.3) { // If UAV is in left 30% of screen
                // Check if there's already an interceptor targeting this drone
                const hasInterceptor = this.swarms.some(swarm => 
                    swarm.targetDrone && swarm.targetDrone.id === drone.id
                );
                
                if (!hasInterceptor) {
                    // Deploy emergency interceptor
                    this.interceptorCount++;
                    const emergencySwarm = {
                        x: 0,
                        y: drone.y + (Math.random() - 0.5) * 50, // Spawn near the escaping drone
                        vx: 8 * this.speedFactor, // Very fast emergency response
                        vy: 0,
                        size: 20,
                        color: '#3b82f6',
                        id: this.interceptorCount,
                        particles: this.generateFormationParticles('line'), // Simple formation for speed
                        formationType: 'emergency',
                        targetDrone: drone,
                        interceptMode: true,
                        trajectory: [{ x: 0, y: drone.y }],
                        rotation: 0,
                        rotationSpeed: 0
                    };
                    
                    this.swarms.push(emergencySwarm);
                }
            }
        });
    }
    
    animate() {
        if (!this.isRunning) return;
        
        this.scenarioTimer++;
        
        // Check if all drones are intercepted (destroyed) - immediate stop
        const activeDrones = this.drones.filter(drone => drone.isActive);
        if (activeDrones.length === 0) {
            this.updateBattleStatus(''); // Remove status message
            this.pause();
            setTimeout(() => this.reset(), 500);
            return;
        }
        
        // Check if all drones have escaped (flown off screen) - also restart
        const remainingDrones = this.drones.filter(drone => drone.isActive || drone.x > -100);
        if (remainingDrones.length === 0) {
            this.updateBattleStatus(''); // Remove status message
            this.pause();
            setTimeout(() => this.reset(), 500);
            return;
        }
        
        // Generate interceptors based on current scenario
        this.generateInterceptorSwarm();
        
        // Emergency backup system - deploy emergency interceptors if UAV gets too close to escape
        this.deployEmergencyInterceptors();
        
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
    
    reset() {
        this.pause();
        this.swarms = [];
        this.interceptionPoints = [];
        this.trajectories = [];
        this.interceptorCount = 0; // Reset interceptor count
        this.battleRound++;
        this.scenarioTimer = 0;
        
        // Move to next scenario
        this.currentScenario = (this.currentScenario + 1) % this.scenarios.length;
        
        this.initializeDrones();
        this.updateBattleStatus(''); // Remove status message
        this.drawBackground();
        // Auto-restart after reset
        setTimeout(() => this.start(), 300);
    }
    
    updateSwarms() {
        for (let i = this.swarms.length - 1; i >= 0; i--) {
            const swarm = this.swarms[i];
            
            // Update rotation
            swarm.rotation += swarm.rotationSpeed;
            
            // Update trajectory
            swarm.trajectory.push({ x: swarm.x, y: swarm.y });
            if (swarm.trajectory.length > 50) {
                swarm.trajectory.shift();
            }
            
            // Find nearest active drone target
            if (!swarm.targetDrone || !swarm.targetDrone.isActive) {
                swarm.targetDrone = this.findNearestDrone(swarm.x, swarm.y);
            }
            
            // Ultra-aggressive intercept behavior for guaranteed success
            if (swarm.targetDrone && swarm.targetDrone.isActive) {
                const distance = Math.sqrt(
                    Math.pow(swarm.x - swarm.targetDrone.x, 2) + Math.pow(swarm.y - swarm.targetDrone.y, 2)
                );
                
                if (distance < 300) { // Much larger detection range
                    swarm.interceptMode = true;
                    // Predictive intercept trajectory - aim ahead of the drone
                    const dx = swarm.targetDrone.x + (swarm.targetDrone.vx * 20) - swarm.x; // Predict 20 frames ahead
                    const dy = swarm.targetDrone.y + (swarm.targetDrone.vy * 20) - swarm.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    if (dist > 0) {
                        swarm.vx = (dx / dist) * 6 * this.speedFactor; // Much faster intercept speed
                        swarm.vy = (dy / dist) * 6 * this.speedFactor;
                    }
                } else {
                    // Even when not in intercept mode, move toward general target area
                    const dx = swarm.targetDrone.x - swarm.x;
                    const dy = swarm.targetDrone.y - swarm.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    if (dist > 0) {
                        swarm.vx = (dx / dist) * 3 * this.speedFactor;
                        swarm.vy = (dy / dist) * 3 * this.speedFactor;
                    }
                }
            }
            
            // Update main swarm position
            swarm.x += swarm.vx;
            swarm.y += swarm.vy;
            
            // Update particles in formation
            swarm.particles.forEach(particle => {
                // Maintain formation while adding slight movement
                particle.x = swarm.x + particle.offsetX + particle.vx;
                particle.y = swarm.y + particle.offsetY + particle.vy;
                particle.rotation += particle.rotationSpeed;
                
                // Small random movements within formation
                particle.vx += (Math.random() - 0.5) * 0.2 * this.speedFactor;
                particle.vy += (Math.random() - 0.5) * 0.2 * this.speedFactor;
                
                // Damping to prevent drift
                particle.vx *= 0.95;
                particle.vy *= 0.95;
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
            
            // No rotation updates for UAVs
            
            drone.maneuverTimer++;
            
            // Continuous left movement
            drone.x += drone.vx;
            
            // Vertical maneuvering
            if (drone.maneuverTimer >= drone.maneuverDuration) {
                // Set new vertical target within patrol area
                const verticalOffset = (Math.random() - 0.5) * drone.patrolRadius;
                drone.targetY = drone.patrolCenterY + verticalOffset;
                
                // Ensure target is within canvas bounds
                drone.targetY = Math.max(50, Math.min(this.canvas.height - 50, drone.targetY));
                
                drone.maneuverTimer = 0;
                drone.maneuverDuration = 60 + Math.random() * 80;
            }
            
            // Move toward vertical target
            const dy = drone.targetY - drone.y;
            const distance = Math.abs(dy);
            
            if (distance > 2) {
                drone.vy = (dy / distance) * 1 * this.speedFactor;
            } else {
                drone.vy *= 0.9;
            }
            
            drone.y += drone.vy;
            
            // Remove drone if it flies off the left side of the canvas
            if (drone.x < -100) {
                drone.isActive = false;
            }
        });
        
        // Remove continuous UAV spawning - only 3 UAVs per round
    }
    
    checkInterceptions() {
        for (let i = this.swarms.length - 1; i >= 0; i--) {
            const swarm = this.swarms[i];
            
            for (let j = this.drones.length - 1; j >= 0; j--) {
                const drone = this.drones[j];
                
                if (!drone.isActive) continue;
                
                // Check collision between swarm particles and drone (generous collision detection)
                for (let particle of swarm.particles) {
                    const distance = Math.sqrt(
                        Math.pow(particle.x - drone.x, 2) + Math.pow(particle.y - drone.y, 2)
                    );
                    
                    // Much more generous collision detection
                    if (distance < (particle.size + drone.size) * 1.5) {
                        // Create explosion effect
                        this.interceptionPoints.push({
                            x: drone.x,
                            y: drone.y,
                            size: 20,
                            alpha: 1.0
                        });
                        
                        // Eliminate drone with single hit
                        drone.isActive = false;
                        
                        // Remove the interceptor swarm
                        this.swarms.splice(i, 1);
                        
                        return; // Exit to avoid index issues
                    }
                }
                
                // Also check collision with swarm center (additional safety net)
                const swarmDistance = Math.sqrt(
                    Math.pow(swarm.x - drone.x, 2) + Math.pow(swarm.y - drone.y, 2)
                );
                
                if (swarmDistance < (swarm.size + drone.size) * 1.2) {
                    // Create explosion effect
                    this.interceptionPoints.push({
                        x: drone.x,
                        y: drone.y,
                        size: 20,
                        alpha: 1.0
                    });
                    
                    // Eliminate drone with single hit
                    drone.isActive = false;
                    
                    // Remove the interceptor swarm
                    this.swarms.splice(i, 1);
                    
                    return; // Exit to avoid index issues
                }
            }
        }
    }
    
    createInterception(swarm, drone) {
        const interception = {
            x: swarm.x,
            y: swarm.y,
            size: 40,
            alpha: 1,
            color: '#3b82f6', // Blue explosion
            droneId: drone.id
        };
        
        this.interceptionPoints.push(interception);
    }
    
    updateBattleStatus(status) {
        const statusElement = document.getElementById('battleStatus');
        if (statusElement) {
            statusElement.textContent = status;
            // Hide the status element if empty
            statusElement.style.display = status ? 'block' : 'none';
        }
    }
    
    draw() {
        this.drawBackground();
        
        // Draw zones first (background elements)
        this.drawProtectionZone();
        this.drawRedZone();
        
        // Draw entities on top of zones
        this.drawSwarms();
        this.drawDrones();
        this.drawInterceptionPoints();
    }
    
    drawProtectionZone() {
        // Draw blue protection zone rectangle (where interceptors operate)
        const protectionZoneLeft = 0;
        const protectionZoneRight = this.canvas.width * 0.6; // Where interceptors head out
        const protectionZoneTop = 0;
        const protectionZoneBottom = this.canvas.height;
        
        // Light blue background for the protection zone
        this.ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
        this.ctx.fillRect(protectionZoneLeft, protectionZoneTop, protectionZoneRight - protectionZoneLeft, protectionZoneBottom - protectionZoneTop);
        
        // Blue dotted border
        this.ctx.strokeStyle = '#3b82f6';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        this.ctx.strokeRect(protectionZoneLeft, protectionZoneTop, protectionZoneRight - protectionZoneLeft, protectionZoneBottom - protectionZoneTop);
        this.ctx.setLineDash([]);
        
        // Protection zone label
        // this.ctx.fillStyle = '#3b82f6';
        // this.ctx.font = 'bold 12px Inter';
        // this.ctx.textAlign = 'center';
        // this.ctx.fillText('PROTECTION ZONE', protectionZoneRight / 2, 20);
    }
    
    drawRedZone() {
        // Draw red detection zone rectangle (where threats are detected)
        const detectionZoneLeft = this.canvas.width * 0.6;
        const detectionZoneRight = this.canvas.width;
        const detectionZoneTop = 0;
        const detectionZoneBottom = this.canvas.height;
        
        // Light red background for the detection zone
        this.ctx.fillStyle = 'rgba(239, 68, 68, 0.1)';
        this.ctx.fillRect(detectionZoneLeft, detectionZoneTop, detectionZoneRight - detectionZoneLeft, detectionZoneBottom - detectionZoneTop);
        
        // Red dotted border
        this.ctx.strokeStyle = '#ef4444';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        this.ctx.strokeRect(detectionZoneLeft, detectionZoneTop, detectionZoneRight - detectionZoneLeft, detectionZoneBottom - detectionZoneTop);
        this.ctx.setLineDash([]);
        
        // // Detection zone label
        // this.ctx.fillStyle = '#ef4444';
        // this.ctx.font = 'bold 12px Inter';
        // this.ctx.textAlign = 'center';
        // this.ctx.fillText('DETECTION ZONE', detectionZoneLeft + (detectionZoneRight - detectionZoneLeft) / 2, 20);
    }
    
    drawDrones() {
        this.drones.forEach(drone => {
            if (!drone.isActive) return;
            
            // Draw drone image
            this.ctx.save();
            this.ctx.translate(drone.x, drone.y);
            this.ctx.rotate(drone.rotation);
            this.ctx.drawImage(
                this.images.target,
                -drone.size, -drone.size,
                drone.size * 2, drone.size * 2
            );
            this.ctx.restore();
        });
    }
    
    drawSwarms() {
        this.swarms.forEach(swarm => {
            // Draw trajectory
            if (swarm.trajectory.length > 1) {
                this.ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.moveTo(swarm.trajectory[0].x, swarm.trajectory[0].y);
                for (let i = 1; i < swarm.trajectory.length; i++) {
                    this.ctx.lineTo(swarm.trajectory[i].x, swarm.trajectory[i].y);
                }
                this.ctx.stroke();
            }
            
            // Draw formation particles
            swarm.particles.forEach(particle => {
                this.ctx.save();
                this.ctx.translate(particle.x, particle.y);
                this.ctx.rotate(particle.rotation);
                this.ctx.globalAlpha = particle.alpha;
                
                this.ctx.drawImage(
                    this.images.interceptor,
                    -particle.size/2, -particle.size/2,
                    particle.size, particle.size
                );
                
                this.ctx.restore();
            });
            
            // Draw targeting line if in intercept mode
            if (swarm.interceptMode && swarm.targetDrone && swarm.targetDrone.isActive) {
                this.ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)';
                this.ctx.lineWidth = 2;
                this.ctx.setLineDash([5, 5]);
                this.ctx.beginPath();
                this.ctx.moveTo(swarm.x, swarm.y);
                this.ctx.lineTo(swarm.targetDrone.x, swarm.targetDrone.y);
                this.ctx.stroke();
                this.ctx.setLineDash([]);
            }
        });
    }
    
    drawInterceptionPoints() {
        for (let i = this.interceptionPoints.length - 1; i >= 0; i--) {
            const point = this.interceptionPoints[i];
            
            this.ctx.save();
            
            // Draw explosion image
            this.ctx.globalAlpha = point.alpha;
            this.ctx.drawImage(
                this.images.explosion,
                point.x - point.size, point.y - point.size,
                point.size * 2, point.size * 2
            );
            
            // Update animation
            point.size += 2 * this.speedFactor;
            point.alpha -= 0.04 * this.speedFactor;
            
            // Remove if faded out
            if (point.alpha <= 0) {
                this.interceptionPoints.splice(i, 1);
            }
            
            this.ctx.restore();
        }
    }
    
    generateFormationParticles(formationType) {
        const particles = [];
        const particleCount = 3 + Math.floor(Math.random() * 2);
        
        for (let i = 0; i < particleCount; i++) {
            let offsetX, offsetY;
            
            switch (formationType) {
                case 'line':
                    offsetX = i * 25 - (particleCount - 1) * 12.5;
                    offsetY = 0;
                    break;
                case 'v-formation':
                    offsetX = i * 20 - (particleCount - 1) * 10;
                    offsetY = Math.abs(i - Math.floor(particleCount / 2)) * 15;
                    break;
                case 'diamond':
                    if (i === 0) { offsetX = 0; offsetY = -20; }
                    else if (i === 1) { offsetX = -20; offsetY = 0; }
                    else if (i === 2) { offsetX = 20; offsetY = 0; }
                    else { offsetX = 0; offsetY = 20; }
                    break;
                case 'circle':
                    const angle = (i / particleCount) * Math.PI * 2;
                    offsetX = Math.cos(angle) * 25;
                    offsetY = Math.sin(angle) * 25;
                    break;
                default:
                    offsetX = (Math.random() - 0.5) * 30;
                    offsetY = (Math.random() - 0.5) * 30;
            }
            
            particles.push({
                x: 0,
                y: 0,
                offsetX: offsetX,
                offsetY: offsetY,
                vx: (Math.random() - 0.5) * 0.5 * this.speedFactor,
                vy: (Math.random() - 0.5) * 0.5 * this.speedFactor,
                size: 8 + Math.random() * 4,
                alpha: 0.7 + Math.random() * 0.3,
                rotation: 0,
                rotationSpeed: (Math.random() - 0.5) * 0.1 * this.speedFactor
            });
        }
        
        return particles;
    }
    
    pause() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
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
    if (!form) return;
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
            navbar.style.background = '#1e3a8a'; // Keep the original blue
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.3)';
        } else {
            navbar.style.background = '#1e3a8a'; // Keep the original blue
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

    // Initialize OBJ viewer if container exists
    // initOBJViewer(); // Commented out - now using static image instead
});

// Export for global access
window.InterceptionVisualization = InterceptionVisualization;
window.scrollToSection = scrollToSection;
window.handleContactForm = handleContactForm; 

// 3D STL Viewer Implementation
function initOBJViewer() {
    console.log('Initializing OBJ viewer...');
    
    // Check if Three.js is available
    if (!window.THREE) {
        console.error('Three.js not loaded!');
        const loadingElement = document.querySelector('.obj-loading');
        if (loadingElement) {
            loadingElement.textContent = 'Error: Three.js not loaded';
        }
        return;
    }
    
    console.log('Three.js available, creating scene...');
    
    const container = document.getElementById('obj-viewer');
    if (!container) {
        console.error('OBJ viewer container not found');
        return;
    }
    
    try {
        // Create scene, camera, and renderer
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf0f0f0);
        
        const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Clear container and add renderer
        container.innerHTML = '';
        container.appendChild(renderer.domElement);
        
        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        directionalLight.castShadow = true;
        scene.add(directionalLight);
        
        // Try to load the drone model - r108 has OBJLoader directly on THREE
        console.log('Checking for OBJLoader...');
        console.log('THREE:', THREE);
        console.log('THREE.OBJLoader:', THREE.OBJLoader);
        
        setTimeout(() => {
            console.log('After timeout - checking OBJLoader availability...');
            
            if (THREE.OBJLoader) {
                console.log('OBJLoader found! Loading drone...');
                loadDroneModel();
            } else {
                console.log('No OBJLoader found, keeping loading indicator');
            }
        }, 1000);
        
        function loadDroneModel() {
            console.log('Creating OBJLoader instance...');
            
            try {
                const loader = new THREE.OBJLoader();
                console.log('OBJLoader created, loading assets/hornbill_medium.obj...');
                
                loader.load('assets/models/hornbill_medium.obj', 
                    function (object) {
                        console.log('SUCCESS! Drone OBJ loaded:', object);
                        console.log('Object type:', typeof object);
                        console.log('Object children count:', object.children.length);
                        console.log('Object children:', object.children);
                        
                        // Count meshes
                        let meshCount = 0;
                        object.traverse(function (child) {
                            if (child.isMesh) {
                                meshCount++;
                                console.log('Found mesh:', child.name, 'Geometry:', child.geometry);
                            }
                        });
                        console.log('Total meshes found:', meshCount);
                        
                        if (meshCount === 0) {
                            console.error('No meshes found in OBJ! Keeping loading indicator.');
                            return;
                        }
                        
                        console.log('Clearing scene and adding drone...');
                        
                        // Remove the loading indicator and add the drone
                        while(scene.children.length > 0) {
                            scene.remove(scene.children[0]);
                        }
                        
                        // Re-add lights
                        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
                        scene.add(ambientLight);
                        
                        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
                        directionalLight.position.set(5, 5, 5);
                        directionalLight.castShadow = true;
                        scene.add(directionalLight);
                        
                        // Apply material to all meshes in the object
                        let materialCount = 0;
                        object.traverse(function (child) {
                            if (child.isMesh) {
                                child.material = new THREE.MeshLambertMaterial({ 
                                    color: 0x666666,
                                    wireframe: false 
                                });
                                child.castShadow = true;
                                child.receiveShadow = true;
                                materialCount++;
                            }
                        });
                        console.log('Applied materials to', materialCount, 'meshes');
                        
                        // Calculate bounding box
                        const box = new THREE.Box3().setFromObject(object);
                        console.log('Bounding box:', box);
                        const center = box.getCenter(new THREE.Vector3());
                        const size = box.getSize(new THREE.Vector3());
                        console.log('Object center:', center, 'Size:', size);
                        
                        // Center the model
                        object.position.sub(center);
                        console.log('Object positioned at:', object.position);
                        
                        // Add to scene
                        scene.add(object);
                        console.log('Object added to scene. Scene children:', scene.children.length);
                        
                        // Position camera zoomed out much more
                        const maxSize = Math.max(size.x, size.y, size.z);
                        const cameraDistance = maxSize * 0.6; // Zoomed out more (increased from 0.4375)
                        camera.position.set(cameraDistance, cameraDistance, cameraDistance);
                        camera.lookAt(0, 0, 0);
                        console.log('Camera positioned at much closer distance:', cameraDistance);
                        
                        // Update the title
                        const title = document.querySelector('.obj-viewer-title');
                        if (title) {
                            title.textContent = 'Hornbill Kinetic';
                        }
                        
                        // Hide loading message
                        const loadingElement = document.querySelector('.obj-loading');
                        if (loadingElement) {
                            loadingElement.style.display = 'none';
                        }
                        
                        console.log('Drone model setup complete!');
                        
                        // Mark model as loaded so animation switches to rotation
                        modelLoaded = true;
                        
                    },
                    function (progress) {
                        console.log('Loading progress:', progress);
                    },
                    function (error) {
                        console.error('ERROR loading drone OBJ:', error);
                        console.log('Error details:', error.message, error.stack);
                        
                        // Keep the loading indicator if OBJ fails to load
                        const title = document.querySelector('.obj-viewer-title');
                        if (title) {
                            title.textContent = 'Hornbill Kinetic (Loading...)';
                        }
                    }
                );
            } catch (error) {
                console.error('ERROR creating OBJLoader:', error);
                console.log('Error details:', error.message, error.stack);
            }
        }
        
        // Create a simple rotating model first (as fallback and while loading)
        console.log('Creating loading indicator...');
        
        // Create a loading indicator instead of torus
        console.log('Creating loading indicator...');
        
        // Create loading text using simple geometry
        const loadingGroup = new THREE.Group();
        
        // Create "Loading Model..." text using simple box geometries
        const letterSpacing = 0.3;
        const letters = [];
        
        // Simple representation - create dots that animate
        for (let i = 0; i < 3; i++) {
            const dotGeometry = new THREE.SphereGeometry(0.1, 8, 8);
            const dotMaterial = new THREE.MeshLambertMaterial({ 
                color: 0x00ff00,
                transparent: true,
                opacity: 0.8
            });
            const dot = new THREE.Mesh(dotGeometry, dotMaterial);
            dot.position.set((i - 1) * 0.5, 0, 0);
            loadingGroup.add(dot);
            letters.push(dot);
        }
        
        // Add a rotating ring around the dots
        const ringGeometry = new THREE.RingGeometry(0.8, 1.0, 16);
        const ringMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x606060,
            transparent: true,
            opacity: 0.6
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2; // Lay flat
        loadingGroup.add(ring);
        
        loadingGroup.castShadow = true;
        loadingGroup.receiveShadow = true;
        scene.add(loadingGroup);
        
        camera.position.set(2.5, 2.5, 2.5); // Zoomed out much more for better view
        camera.lookAt(0, 0, 0);
        
        console.log('Starting animation...');
        
        // Animation loop with loading indicator animation and model rotation
        let currentObject = loadingGroup;
        let animationTime = 0;
        let modelLoaded = false;
        
        function animate() {
            requestAnimationFrame(animate);
            animationTime += 0.08; // Faster animation time increment
            
            if (!modelLoaded && loadingGroup.parent === scene) {
                // Animate loading dots (pulsing effect)
                letters.forEach((dot, index) => {
                    const phase = animationTime + (index * Math.PI / 3);
                    dot.scale.setScalar(1 + 0.3 * Math.sin(phase));
                    dot.material.opacity = 0.5 + 0.3 * Math.sin(phase);
                });
                
                // Rotate the ring faster
                ring.rotation.z += 0.04; // Faster ring rotation
                
                // Rotate the entire loading group faster
                loadingGroup.rotation.y += 0.015; // Faster loading group rotation
            } else {
                // Model is loaded - rotate around Y axis only
                scene.children.forEach(child => {
                    if (child.isGroup || (child.isMesh && child !== ring)) {
                        child.rotation.y += 0.02; // Y axis rotation only
                    }
                });
            }
            
            renderer.render(scene, camera);
        }
        animate();
        
        console.log('3D viewer initialized successfully');
        
    } catch (error) {
        console.error('Error creating scene:', error);
        const loadingElement = document.querySelector('.obj-loading');
        if (loadingElement) {
            loadingElement.textContent = 'Error: ' + error.message;
        }
    }
    
    // Handle window resize
    window.addEventListener('resize', function() {
        const width = container.clientWidth;
        const height = container.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    });
}