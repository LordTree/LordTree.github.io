const canvas = document.querySelector("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext("2d");
const maxMainHeight = window.innerHeight * 0.85;
const maxTtlBranches = 20000;

class Branch {
    constructor(basePoint, angle, level, parentPercent) {
        this.basePoint = basePoint;
        this.angle = angle;
        this.level = level;
        this.length = 0;
        this.maxLength = maxMainHeight / (Math.pow(level, 3) * (parentPercent || 1)) * (1 + (0.3 * Math.random() - 0.15));
        this.thickness = 1.5;
        this.maxThickness = 10 / Math.pow(level, 2);
        this.growthRate = 10 * 60;
        this.branchRate = 0.6 / Math.pow(level, 3);
        this.minLengthForBranch = this.maxLength * 0.25;
        this.age = 0;
        this.isGrowing = true;
    }

    grow() {
        if (this.isGrowing) {
            this.growLonger();
            this.growThicker();
            if (this.canBranch()) {
                this.growBranch();
            }
            this.age += 1;
        }
    }

    growLonger() {
        const nextLength = this.growParabolic(this.age, this.growthRate, this.maxLength);
        if (this.age <= this.growthRate) {
            this.length = nextLength;
        } else {
            this.isGrowing = false;
        }
    }

    growThicker() {
        this.thickness = this.growParabolic(this.age, this.growthRate, this.maxThickness);
    }

    growParabolic(x, rate, max) {
        return - x * (x - rate * 2) * max / Math.pow(rate, 2);
    }

    growBranch() {
        const endpoint = this.getEndpoint();
        const parentPercent = this.length / this.maxLength;
        let angle;
        if (this.level === 1) {
            const side = Math.random() < 0.5 ? 1 : -1;
            angle = Math.PI/2 + 1 * side;
        } else {
            angle = Math.PI/2 - (this.angle - Math.PI/2);
        }
        
        const branch = new Branch(endpoint, angle, this.level + 1, parentPercent);
        allBranches.push(branch);
    }

    canBranch() {
        return (
            allBranches.length <= maxTtlBranches
            && this.length < this.maxLength
            && this.length >= this.minLengthForBranch
            && Math.random() < this.branchRate
        )
    }

    draw(ctx) {
        const endpoint = this.getEndpoint();
        ctx.strokeStyle = this.level == 1 ? "#775440" : "#11933a";
        ctx.lineWidth = this.thickness;
        ctx.beginPath();
        ctx.moveTo(...this.basePoint);
        ctx.lineTo(...endpoint);
        ctx.stroke();
    }

    getEndpoint() {
        const x = this.basePoint[0] + this.length * Math.cos(this.angle);
        const y = this.basePoint[1] + this.length * Math.sin(this.angle);
        return [x, y];
    }
}



const beginPoint = [window.innerWidth/2, window.innerHeight];
const allBranches = [new Branch(beginPoint, -Math.PI/2, 1)];

function run() {
    let requestId;

    ctx.clearRect(0,0,window.innerWidth, window.innerHeight);
    for (const b of allBranches) {
        b.grow();
        b.draw(ctx);
    }

    if (!requestId) {
        requestId = window.requestAnimationFrame(run, ctx)
    }
}


run();
