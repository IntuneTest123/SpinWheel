let items = [];
let wheel;

class Wheel {
    constructor(canvas, items) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.items = items;
        this.rotation = 0;
        this.isSpinning = false;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = this.canvas.width / 2 - 10;
        
        // ဘီးကို ဆွဲပါမယ်
        this.ctx.save();
        this.ctx.translate(centerX, centerY);
        this.ctx.rotate(this.rotation);
        
        const sliceAngle = (2 * Math.PI) / this.items.length;
        
        this.items.forEach((item, i) => {
            const startAngle = i * sliceAngle;
            const endAngle = startAngle + sliceAngle;
            
            // အပိုင်းအစတွေကို ဆွဲပါမယ်
            this.ctx.beginPath();
            this.ctx.moveTo(0, 0);
            this.ctx.arc(0, 0, radius, startAngle, endAngle);
            this.ctx.closePath();
            
            // ပိုပြီး တောက်ပတဲ့ အရောင်တွေသုံးပါမယ်
            const hue = (360 / this.items.length) * i;
            this.ctx.fillStyle = `hsl(${hue}, 100%, 65%)`;
            this.ctx.fill();
            
            // အနားသတ်များထည့်ပါမယ်
            this.ctx.strokeStyle = 'white';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
            // စာသားတွေ ရေးပါမယ်
            this.ctx.save();
            this.ctx.rotate(startAngle + sliceAngle / 2);
            this.ctx.textAlign = 'right';
            this.ctx.fillStyle = 'white';
            this.ctx.font = '16px Arial';
            this.ctx.fillText(item, radius - 20, 5);
            this.ctx.restore();
        });
        
        this.ctx.restore();
    }

    getWinner() {
        // Normalize the rotation to be between 0 and 2π
        const normalizedRotation = (this.rotation % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
        const sliceAngle = (Math.PI * 2) / this.items.length;
        
        // Adjust the calculation to match the indicator position
        // Add π to offset the indicator pointing at top (π/2 for right, π for bottom, 3π/2 for left)
        const adjustedRotation = (normalizedRotation + Math.PI) % (Math.PI * 2);
        
        // Calculate the winning index
        const winningIndex = (this.items.length - Math.floor(adjustedRotation / sliceAngle)) % this.items.length;
        
        return {
            item: this.items[winningIndex],
            index: winningIndex
        };
    }

    spin() {
        if (this.isSpinning) return;
        
        this.isSpinning = true;
        const spinDuration = 4000;
        const startRotation = this.rotation;
        const extraSpins = 5;
        const endRotation = startRotation + (Math.PI * 2 * extraSpins) + (Math.random() * Math.PI * 2);
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / spinDuration, 1);
            
            const eased = 1 - Math.pow(1 - progress, 3);
            
            this.rotation = startRotation + (endRotation - startRotation) * eased;
            this.draw();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.isSpinning = false;
                const winner = this.getWinner();
                showWinner(winner.item, winner.index);
            }
        };
        
        requestAnimationFrame(animate);
    }
}

function showWinner(winnerItem, winnerIndex) {
    document.getElementById('winnerText').textContent = `The winner is: ${winnerItem}`;
    document.getElementById('winnerDialog').style.display = 'block';
    
    // အနိုင်ရသူကို ဖျက်ပါမယ်
    $.ajax({
        url: './delete_item.php',
        method: 'POST',
        data: { index: winnerIndex },
        success: function(response) {
            items = JSON.parse(response);
            // Dialog ပိတ်ပြီးမှ wheel ကို update လုပ်ပါမယ်
        }
    });
}

function closeWinnerDialog() {
    document.getElementById('winnerDialog').style.display = 'none';
    updateItemsList();
    initWheel();
}

// Items တွေကို server ကနေ ယူပါမယ်
function loadItems() {
    $.ajax({
        url: './get_items.php',
        method: 'GET',
        success: function(response) {
            items = JSON.parse(response);
            updateItemsList();
            initWheel();
        }
    });
}

function updateItemsList() {
    const itemsList = $('#itemsList');
    itemsList.empty();
    
    items.forEach((item, index) => {
        itemsList.append(`
            <li>
                ${item}
                <span class="delete-btn" data-index="${index}">
                    <i class="fas fa-times"></i>
                </span>
            </li>
        `);
    });
}

function initWheel() {
    const canvas = document.getElementById('wheelCanvas');
    wheel = new Wheel(canvas, items);
    wheel.draw();
}

// Event handlers
$(document).ready(function() {
    loadItems();
    
    $('#addItemForm').on('submit', function(e) {
        e.preventDefault();
        const newItem = $('#newItem').val().trim();
        if (!newItem) return;
        
        $.ajax({
            url: './add_item.php',
            method: 'POST',
            data: { item: newItem },
            success: function(response) {
                items = JSON.parse(response);
                updateItemsList();
                initWheel();
                $('#newItem').val('');
            }
        });
    });
    
    $('#itemsList').on('click', '.delete-btn', function() {
        const index = $(this).data('index');
        
        $.ajax({
            url: './delete_item.php',
            method: 'POST',
            data: { index: index },
            success: function(response) {
                items = JSON.parse(response);
                updateItemsList();
                initWheel();
            }
        });
    });
    
    $('.wheel-container').on('click', function() {
        if (items.length > 1) {
            wheel.spin();
        }
    });
}); 