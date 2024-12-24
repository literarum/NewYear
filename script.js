// Получение элементов DOM
const timerElement = document.getElementById('timer');
const celebrationMessage = document.getElementById('celebrationMessage');
const animatedContainer = document.getElementById('animatedContainer');
const snowCanvas = document.getElementById('snowCanvas');
const canvasContext = snowCanvas.getContext('2d');

/* Настройка размеров Canvas с дебаунсом */
function resizeCanvas() {
    snowCanvas.width = window.innerWidth;
    snowCanvas.height = window.innerHeight;
}

// Вызов функции для установки размеров при загрузке и изменении окна
window.addEventListener('resize', debounce(resizeCanvas, 100));
resizeCanvas();

/* Пул объектов снежинок для оптимизации */
const snowflakePool = [];

/**
 * Получение снежинки из пула или создание новой, если пул пуст
 * @returns {Snowflake} Снежинка
 */
function getSnowflake() {
    if (snowflakePool.length > 0) {
        return snowflakePool.pop();
    } else {
        return new Snowflake();
    }
}

/**
 * Возврат снежинки в пул
 * @param {Snowflake} snowflake Снежинка
 */
function releaseSnowflake(snowflake) {
    snowflakePool.push(snowflake);
}

/* Класс для представления снежинки */
class Snowflake {
    constructor() {
        // Инициализация позиции снежинки за пределами видимой области для плавного появления
        this.resetPosition();
        // Размер снежинки
        this.size = Math.random() * 3 + 3;
        // Скорость падения по вертикали
        this.speedY = Math.random() * 1 + 0.5;
        // Текущая скорость ветра по горизонтали
        this.currentSpeedX = 0;
        // Целевая скорость ветра по горизонтали
        this.targetSpeedX = 0;
        // Скорость изменения ветра для плавности
        this.windChangeRate = 0.002; // Увеличена для более заметного эффекта ветра
        // Время до следующего изменения ветра
        this.windChangeInterval = Math.random() * 3000 + 2000; // от 2 до 5 секунд
        this.windTimer = 0;
        // Тип снежинки для разнообразия форм
        this.type = Math.floor(Math.random() * 3); // 0, 1 или 2
    }

    /**
     * Сброс позиции снежинки на верхнюю границу Canvas с рандомным горизонтальным положением
     */
    resetPosition() {
        this.x = Math.random() * snowCanvas.width;
        this.y = -Math.random() * snowCanvas.height;
    }

    /**
     * Обновление позиции снежинки
     * @param {number} deltaTime Время, прошедшее с последнего кадра
     */
    update(deltaTime) {
        // Обновление таймера ветра
        this.windTimer += deltaTime;
        if (this.windTimer > this.windChangeInterval) {
            // Установка новой целевой скорости ветра с увеличенным диапазоном
            this.targetSpeedX = (Math.random() - 0.5) * 1.0; // Увеличено для более сильного ветра
            // Сброс таймера
            this.windTimer = 0;
            // Новое время до следующего изменения ветра
            this.windChangeInterval = Math.random() * 5000 + 2000; // от 2 до 7 секунд
        }

        // Плавное изменение текущей скорости ветра к целевой скорости
        if (this.currentSpeedX < this.targetSpeedX) {
            this.currentSpeedX += this.windChangeRate * deltaTime;
            if (this.currentSpeedX > this.targetSpeedX) {
                this.currentSpeedX = this.targetSpeedX;
            }
        } else if (this.currentSpeedX > this.targetSpeedX) {
            this.currentSpeedX -= this.windChangeRate * deltaTime;
            if (this.currentSpeedX < this.targetSpeedX) {
                this.currentSpeedX = this.targetSpeedX;
            }
        }

        // Обновление позиции
        this.x += this.currentSpeedX;
        this.y += this.speedY;

        // Проверка выхода за нижнюю границу Canvas
        if (this.y > snowCanvas.height + this.size) {
            this.resetPosition();
        }

        // Проверка выхода за боковые границы Canvas и корректировка позиции
        if (this.x > snowCanvas.width + this.size) {
            this.x = -this.size;
        } else if (this.x < -this.size) {
            this.x = snowCanvas.width + this.size;
        }
    }

    /**
     * Отрисовка снежинки на Canvas
     * @param {CanvasRenderingContext2D} context Контекст Canvas
     */
    draw(context) {
        context.save();
        context.translate(this.x, this.y);
        context.scale(this.size / 5, this.size / 5);
        context.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        context.lineWidth = 1;
        context.beginPath();
        // Рисуем различные типы снежинок
        if (this.type === 0) {
            // Простая снежинка
            for (let i = 0; i < 6; i++) {
                context.moveTo(0, 0);
                context.lineTo(0, -5);
                context.rotate(Math.PI / 3);
            }
        } else if (this.type === 1) {
            // Снежинка с ответвлениями
            for (let i = 0; i < 8; i++) {
                context.moveTo(0, 0);
                context.lineTo(0, -5);
                context.moveTo(0, -3);
                context.lineTo(2, -5);
                context.moveTo(0, -3);
                context.lineTo(-2, -5);
                context.rotate(Math.PI / 4);
            }
        } else {
            // Сложная снежинка
            for (let i = 0; i < 12; i++) {
                context.moveTo(0, 0);
                context.lineTo(0, -5);
                context.moveTo(0, -2);
                context.lineTo(2, -3);
                context.lineTo(-2, -3);
                context.rotate(Math.PI / 6);
            }
        }
        context.stroke();
        context.restore();
    }
}

/* Массив для хранения активных снежинок */
const activeSnowflakes = [];
const TOTAL_SNOWFLAKES = 300; // Общее количество снежинок

/* Инициализация снежинок */
function initializeSnowflakes() {
    for (let i = 0; i < TOTAL_SNOWFLAKES; i++) {
        const snowflake = getSnowflake();
        activeSnowflakes.push(snowflake);
    }
}

initializeSnowflakes();

let lastFrameTime = performance.now();

/* Функция анимации */
function animateSnowfall(currentTime) {
    const deltaTime = currentTime - lastFrameTime;
    lastFrameTime = currentTime;

    // Очистка Canvas
    canvasContext.clearRect(0, 0, snowCanvas.width, snowCanvas.height);

    // Обновление и отрисовка каждой снежинки
    activeSnowflakes.forEach(snowflake => {
        snowflake.update(deltaTime);
        snowflake.draw(canvasContext);
    });

    requestAnimationFrame(animateSnowfall);
}

// Запуск анимации
requestAnimationFrame(animateSnowfall);

/* Функция для анимации градиента контейнера */
const gradientColors = [
    [0, 31, 63],
    [10, 116, 218],
    [29, 158, 238],
    [58, 175, 219],
    [93, 193, 224]
];

let currentGradientIndex = 0;

/**
 * Интерполяция между двумя цветами
 * @param {number[]} startColor Начальный цвет [R, G, B]
 * @param {number[]} endColor Конечный цвет [R, G, B]
 * @param {number} factor Коэффициент интерполяции (0 - 1)
 * @returns {number[]} Интерполированный цвет [R, G, B]
 */
function interpolateColors(startColor, endColor, factor) {
    return startColor.map((start, index) => Math.round(start + (endColor[index] - start) * factor));
}

/**
 * Применение цвета к фону контейнера
 * @param {HTMLElement} container Элемент контейнера
 * @param {number[]} color Цвет [R, G, B]
 */
function applyGradientColor(container, color) {
    container.style.background = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.85)`;
}

/**
 * Шаг интерполяции цвета
 * @param {number[]} startColor Начальный цвет [R, G, B]
 * @param {number[]} endColor Конечный цвет [R, G, B]
 * @param {number} steps Количество шагов интерполяции
 * @param {HTMLElement} container Элемент контейнера
 */
function stepGradient(startColor, endColor, steps, container) {
    let step = 0;

    function stepFunction() {
        const interpolatedColor = interpolateColors(startColor, endColor, step / steps);
        applyGradientColor(container, interpolatedColor);

        if (step < steps) {
            step++;
            requestAnimationFrame(stepFunction);
        }
    }

    stepFunction();
}

/**
 * Запуск анимации градиента
 */
function animateGradientBackground() {
    const nextIndex = (currentGradientIndex + 1) % gradientColors.length;
    const startColor = gradientColors[currentGradientIndex];
    const endColor = gradientColors[nextIndex];
    const totalSteps = 1200;

    stepGradient(startColor, endColor, totalSteps, animatedContainer);
    currentGradientIndex = nextIndex;
}

// Запуск анимации градиента
animateGradientBackground();

/* Задаем время наступления праздника (01.01.2025 00:00:00.000 Ульяновское время) */
const CELEBRATION_TIME = new Date('2025-01-01T00:00:00+04:00').getTime();
let timerAnimationFrameId = null;

/* Функция склонения слов */
function getDeclension(number, words) {
    const mod10 = number % 10;
    const mod100 = number % 100;
    if (mod100 >= 11 && mod100 <= 19) return words[2];
    if (mod10 === 1) return words[0];
    if (mod10 >= 2 && mod10 <= 4) return words[1];
    return words[2];
}

/**
 * Вычисление оставшегося времени до праздника
 * @param {number} currentTime Текущее время в миллисекундах
 * @param {number} targetTime Время праздника в миллисекундах
 * @returns {Object} Объект с оставшимися днями, часами, минутами и секундами
 */
function calculateTimeDifference(currentTime, targetTime) {
    const timeDifference = targetTime - currentTime;

    const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDifference / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((timeDifference / (1000 * 60)) % 60);
    const seconds = Math.floor((timeDifference / 1000) % 60);

    return {
        days,
        hours,
        minutes,
        seconds
    };
}

/**
 * Обновление таймера обратного отсчета
 */
function updateCountdownTimer() {
    const currentTime = Date.now();
    const { days, hours, minutes, seconds } = calculateTimeDifference(currentTime, CELEBRATION_TIME);
    const timeDifference = CELEBRATION_TIME - currentTime;

    if (timeDifference <= 0) {
        // Если наступило время праздника
        timerElement.classList.replace('visible', 'hidden');
        celebrationMessage.classList.replace('hidden', 'visible');
        if (timerAnimationFrameId) {
            cancelAnimationFrame(timerAnimationFrameId);
        }
    } else {
        // Форматируем оставшееся время с корректными склонениями
        timerElement.textContent = `${days} ${getDeclension(days, ['день', 'дня', 'дней'])}, ` +
            `${hours} ${getDeclension(hours, ['час', 'часа', 'часов'])}, ` +
            `${minutes} ${getDeclension(minutes, ['минута', 'минуты', 'минут'])}, ` +
            `${seconds} ${getDeclension(seconds, ['секунда', 'секунды', 'секунд'])}`;
        timerAnimationFrameId = requestAnimationFrame(updateCountdownTimer);
    }
}

// Запуск таймера
updateCountdownTimer();

/**
 * Утилита для дебаунса - предотвращает частые вызовы функции
 * @param {Function} func Функция для дебаунса
 * @param {number} wait Время ожидания в миллисекундах
 * @returns {Function} Дебаунсированная функция
 */
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

class ChristmasTree {
    constructor(container, options = {}) {
        this.container = container;
        this.width = options.width || 300;
        this.height = options.height || 450;
        this.ornaments = options.ornaments || this.defaultOrnaments();
        this.svg = null; // Reference to the SVG element
        this.init();
    }

    createSvgElement(tag, attributes = {}) {
        if (!tag || typeof tag !== "string") {
            throw new Error("Invalid SVG tag");
        }

        const xmlns = "http://www.w3.org/2000/svg";
        const element = document.createElementNS(xmlns, tag);

        for (const [key, value] of Object.entries(attributes)) {
            if (key && typeof key === "string" && value != null) {
                element.setAttribute(key, value);
            } else {
                console.warn(`Invalid attribute: ${key}=${value}`);
            }
        }

        return element;
    }

    defaultOrnaments() {
        return [
            { cx: 40, cy: 240, r: 5, fill: "#FF69B4", class: "ornament" },
            { cx: 70, cy: 230, r: 5, fill: "#FFD700", class: "ornament" },
            { cx: 100, cy: 240, r: 5, fill: "#800080", class: "ornament" },
            { cx: 130, cy: 230, r: 5, fill: "#8B0000", class: "ornament" },
            { cx: 160, cy: 240, r: 5, fill: "#7CFC00", class: "ornament" },

            { cx: 50, cy: 190, r: 5, fill: "#FFA500", class: "ornament" },
            { cx: 80, cy: 180, r: 5, fill: "#FF69B4", class: "ornament" },
            { cx: 100, cy: 190, r: 5, fill: "#FFD700", class: "ornament" },
            { cx: 120, cy: 180, r: 5, fill: "#800080", class: "ornament" },
            { cx: 150, cy: 190, r: 5, fill: "#8B0000", class: "ornament" },

            { cx: 70, cy: 150, r: 5, fill: "#FFD700", class: "ornament" },
            { cx: 100, cy: 120, r: 5, fill: "#7CFC00", class: "ornament" },
            { cx: 130, cy: 150, r: 5, fill: "#FF69B4", class: "ornament" }
        ];
    }

    init() {
        this.cleanup(); // Ensure previous SVG is removed

        this.svg = this.createSvgElement("svg", {
            viewBox: "0 0 200 300",
            width: this.width,
            height: this.height,
            xmlns: "http://www.w3.org/2000/svg",
            "preserveAspectRatio": "xMidYMid meet"
        });

        // Add gradients and filters
        const defs = this.createSvgElement("defs");

        const gradient1 = this.createSvgElement("linearGradient", {
            id: "gradient1",
            x1: "0",
            y1: "0",
            x2: "1",
            y2: "1"
        });
        gradient1.appendChild(this.createSvgElement("stop", { offset: "0%", "stop-color": "#FF4500" }));
        gradient1.appendChild(this.createSvgElement("stop", { offset: "100%", "stop-color": "#FFD700" }));
        defs.appendChild(gradient1);

        const trunkGradient = this.createSvgElement("linearGradient", {
            id: "trunkGradientPattern",
            x1: "0",
            y1: "0",
            x2: "0",
            y2: "1"
        });
        trunkGradient.appendChild(this.createSvgElement("stop", { offset: "0%", "stop-color": "#8B4513" }));
        trunkGradient.appendChild(this.createSvgElement("stop", { offset: "50%", "stop-color": "#A0522D" }));
        trunkGradient.appendChild(this.createSvgElement("stop", { offset: "100%", "stop-color": "#8B4513" }));
        defs.appendChild(trunkGradient);

        const glowFilter = this.createSvgElement("filter", {
            id: "glowEffect",
            x: "-50%",
            y: "-50%",
            width: "200%",
            height: "200%"
        });
        const gaussianBlur = this.createSvgElement("feGaussianBlur", {
            in: "SourceGraphic",
            stdDeviation: "2",
            result: "blur"
        });
        const feMerge = this.createSvgElement("feMerge");
        feMerge.appendChild(this.createSvgElement("feMergeNode", { in: "blur" }));
        feMerge.appendChild(this.createSvgElement("feMergeNode", { in: "SourceGraphic" }));
        glowFilter.appendChild(gaussianBlur);
        glowFilter.appendChild(feMerge);
        defs.appendChild(glowFilter);

        const flickerAnimation = this.createSvgElement("style");
        flickerAnimation.textContent = `
            .ornament {
                animation: flicker 1.5s infinite;
            }

            .star {
                animation: flickerStar 2s infinite;
            }

            @keyframes flicker {
                0%, 100% {
                    opacity: 1;
                }
                50% {
                    opacity: 0.5;
                }
            }

            @keyframes flickerStar {
                0%, 100% {
                    opacity: 1;
                }
                50% {
                    opacity: 0.7;
                }
            }
        `;
        defs.appendChild(flickerAnimation);

        this.svg.appendChild(defs);

        // Add trunk
        const trunk = this.createSvgElement("rect", {
            x: 90, y: 260, width: 20, height: 30, fill: "url(#trunkGradientPattern)"
        });
        this.svg.appendChild(trunk);

        // Add tree layers
        this.createTreeLayers();

        // Add ornaments
        this.ornaments.forEach(ornament => {
            const circle = this.createSvgElement("circle", ornament);
            this.svg.appendChild(circle);
        });

        // Add star
        const star = this.createSvgElement("polygon", {
            points: "100,60 110,80 130,80 115,90 120,110 100,100 80,110 85,90 70,80 90,80",
            fill: "#FFD700",
            stroke: "#DAA520",
            "stroke-width": 1,
            filter: "url(#glowEffect)",
            class: "star"
        });
        this.svg.appendChild(star);

        // Append the SVG to the container
        this.container.appendChild(this.svg);
    }

    createTreeLayers() {
        const layers = [
            { points: "20,260 100,140 180,260", class: "lower", fill: "#1B5E20" },
            { points: "40,200 100,110 160,200", class: "middle", fill: "#2E7D32" },
            { points: "60,160 100,80 140,160", class: "upper", fill: "#388E3C" }
        ];
        layers.forEach(layer => {
            const polygon = this.createSvgElement("polygon", layer);
            this.svg.appendChild(polygon);
        });
    }

    cleanup() {
        if (this.svg) {
            this.container.removeChild(this.svg);
            this.svg = null;
        }
    }
}

// Create an instance of ChristmasTree
window.addEventListener('DOMContentLoaded', () => {
    const container = document.body;
    new ChristmasTree(container, { width: 400, height: 600 });
});



class TreeOrnament {
    constructor(containerId, decorationsId) {
        this.container = document.getElementById(containerId);
        this.treeDecorations = document.getElementById(decorationsId);
        this.treeSize = 20; // Размер каждой ёлочки в пикселях
        this.densityFactor = 2.5; // Коэффициент для уменьшения количества ёлочек
        this.padding = 12; // Отступ ёлочек от краёв контейнера
        this.treeStyle = `width: ${this.treeSize}px; height: ${this.treeSize}px; filter: brightness(400%) contrast(400%);`; // Стиль ёлочек

        // Инициализация
        this.createTreeOrnament();
        window.addEventListener('resize', this.debounce(() => this.createTreeOrnament(), 100));
    }

    // Удаляет все существующие ёлочки
    clearDecorations() {
        while (this.treeDecorations.firstChild) {
            this.treeDecorations.removeChild(this.treeDecorations.firstChild);
        }
    }

    // Создаёт и добавляет ёлочку в указанной позиции
    createTree(x, y) {
        const tree = document.createElement('div');
        tree.className = 'tree';
        tree.style.cssText = `position: absolute; left: ${x}px; top: ${y}px; ${this.treeStyle}`;
        this.treeDecorations.appendChild(tree);
    }

    // Рассчитывает и создаёт орнамент из ёлочек
    createTreeOrnament() {
        this.clearDecorations();

        const { offsetWidth: width, offsetHeight: height } = this.container;

        const treesTopBottom = Math.ceil((width - 2 * this.padding) / (this.treeSize * this.densityFactor));
        const treesLeftRight = Math.ceil((height - 2 * this.padding) / (this.treeSize * this.densityFactor));

        for (let i = 0; i < treesTopBottom; i++) {
            const x = this.padding + i * this.treeSize * this.densityFactor;
            if (i > 0 && i < treesTopBottom - 1) {
                this.createTree(x, this.padding); // Верхняя граница
                this.createTree(x, height - this.padding - this.treeSize); // Нижняя граница
            }
        }

        for (let i = 0; i < treesLeftRight; i++) {
            const y = this.padding + i * this.treeSize * this.densityFactor;
            if (i > 0 && i < treesLeftRight - 1) {
                this.createTree(this.padding, y); // Левая граница
                this.createTree(width - this.padding - this.treeSize, y); // Правая граница
            }
        }

        // Добавляем угловые ёлочки единожды
        this.createTree(this.padding, this.padding); // Верхний левый угол
        this.createTree(width - this.padding - this.treeSize, this.padding); // Верхний правый угол
        this.createTree(this.padding, height - this.padding - this.treeSize); // Нижний левый угол
        this.createTree(width - this.padding - this.treeSize, height - this.padding - this.treeSize); // Нижний правый угол
    }

    // Дебаунс-функция для оптимизации вызовов
    debounce(func, wait) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }
}

// Инициализация класса
new TreeOrnament('animatedContainer', 'treeDecorations');

// Класс для проверки корректности отображения элементов страницы
class ScreenRenderingChecker {
    constructor(config = { diagonalThreshold: 600 }) {
        this.config = config;
        this.precomputedDiagonals = new Map([
            ['1920x1080', 2202.91],
            ['1366x768', 1560.84],
            ['1280x720', 1468.68],
            ['1024x768', 1280],
            ['800x600', 1000],
        ]);
    }

    getScreenDiagonal(screenWidth, screenHeight) {
        const screenKey = `${screenWidth}x${screenHeight}`;
        return this.precomputedDiagonals.has(screenKey)
            ? this.precomputedDiagonals.get(screenKey)
            : Math.sqrt(Math.pow(screenWidth, 2) + Math.pow(screenHeight, 2));
    }

    checkRenderingIssues() {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const screenDiagonal = this.getScreenDiagonal(screenWidth, screenHeight);

        if (screenDiagonal < this.config.diagonalThreshold) {
            alert("Ваше устройство может некорректно отображать открытку. Элементы интерфейса могут быть смещены. Попробуйте открыть сайт на устройстве с большим экраном.");
        }
    }
}


// Технический класс для мониторинга производительности устройства
class PerformanceMonitor {
    constructor(interval = 5000) {
        this.interval = interval; // Интервал обновления данных (в миллисекундах)
        this.monitoring = false;
        this.frameTimes = [];
        this.cpuUsage = 'N/A';
        this.maxCpuUsage = 0;
        this.totalCpuUsage = 0;
        this.cpuSamples = 0;
        this.maxFps = 0;
        this.totalFps = 0;
        this.fpsSamples = 0;
    }

    startMonitoring() {
        if (this.monitoring) return;
        this.monitoring = true;

        this.startFrameRateMonitoring();
        this.startCpuMonitoring();

        this.monitorInterval = setInterval(() => {
            const memory = window.performance.memory || {};
            const usedJSHeapSize = memory.usedJSHeapSize !== undefined ? (memory.usedJSHeapSize / 1024 / 1024).toFixed(2) : 'N/A';
            const totalJSHeapSize = memory.totalJSHeapSize !== undefined ? (memory.totalJSHeapSize / 1024 / 1024).toFixed(2) : 'N/A';

            const averageFps = (this.totalFps / this.fpsSamples).toFixed(2);
            const averageCpu = (this.totalCpuUsage / this.cpuSamples).toFixed(2);

            console.clear();
            console.log(`Performance Monitoring:`);
            console.log(`- JS Heap Size: ${usedJSHeapSize} MB used / ${totalJSHeapSize} MB total`);
            console.log(`- CPU Usage: ${this.cpuUsage} (Max: ${this.maxCpuUsage.toFixed(2)}%, Avg: ${averageCpu}%)`);
            console.log(`- Frame Rate: ${this.getFrameRate()} fps (Max: ${this.maxFps}, Avg: ${averageFps})`);
        }, this.interval);
    }

    stopMonitoring() {
        if (!this.monitoring) return;
        clearInterval(this.monitorInterval);
        this.monitoring = false;
    }

    startFrameRateMonitoring() {
        const calculateFrameRate = () => {
            const now = performance.now();
            this.frameTimes.push(now);

            // Убираем записи старше 1 секунды
            this.frameTimes = this.frameTimes.filter(time => now - time <= 1000);

            const fps = this.frameTimes.length;
            this.maxFps = Math.max(this.maxFps, fps);
            this.totalFps += fps;
            this.fpsSamples++;

            // Вызываем следующий кадр
            if (this.monitoring) requestAnimationFrame(calculateFrameRate);
        };
        requestAnimationFrame(calculateFrameRate);
    }

    getFrameRate() {
        return this.frameTimes.length;
    }

    startCpuMonitoring() {
        const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            let cpuTime = 0;

            entries.forEach((entry) => {
                if (entry.entryType === 'longtask') {
                    cpuTime += entry.duration;
                }
            });

            // Рассчитываем процент загрузки CPU
            const monitoringInterval = this.interval / 1000; // Интервал в секундах
            const cpuUsage = (cpuTime / (monitoringInterval * 1000)) * 100;

            this.cpuUsage = `${cpuUsage.toFixed(2)}%`;
            this.maxCpuUsage = Math.max(this.maxCpuUsage, cpuUsage);
            this.totalCpuUsage += cpuUsage;
            this.cpuSamples++;
        });

        observer.observe({ entryTypes: ['longtask'] });
    }
}

// Создаем экземпляр класса и запускаем мониторинг производительности
const performanceMonitor = new PerformanceMonitor();
performanceMonitor.startMonitoring();

// Создаем экземпляр класса и проверяем отображение
const renderingChecker = new ScreenRenderingChecker();
renderingChecker.checkRenderingIssues();
