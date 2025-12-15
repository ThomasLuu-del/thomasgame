// --- Cấu hình Trò chơi ---
const PULL_STRENGTH = 30; // Số pixel kéo mỗi lần đúng.
const MAX_PULL = 350;     // Khoảng cách tối đa (pixel) để thắng.

let tugOfWarPosition = 0; // 0 là trung tâm, âm: Đội 1 kéo, dương: Đội 2 kéo.
let currentProblem1 = { answer: 0 };
let currentProblem2 = { answer: 0 };
let scoreTeam1 = 0;
let scoreTeam2 = 0;
let isGameActive = true;

// BIẾN MỚI CHO VIỆC LUÂN PHIÊN PHÉP TÍNH:
const OPERATION_CYCLE = ['+', '-', '×', '÷'];
let operationIndex = 0; // Bắt đầu từ '+'

// Biến DOM được gán sau khi trang tải xong
let problemEl1, problemEl2;
let answerInput1, answerInput2;
let feedbackEl1, feedbackEl2;
let scoreEl1, scoreEl2;
let flagWrapper;
let modal, modalTitle, modalMessage;
let newRoundBtn, nextRoundBtn;

// --- Hàm tiện ích ---
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Tạo bài toán ngẫu nhiên (ĐÃ CẬP NHẬT để luân phiên phép tính)
function generateProblem() {
    // 1. CHỌN PHÉP TOÁN TUẦN TỰ
    const op = OPERATION_CYCLE[operationIndex];
    // Tăng chỉ số cho lần gọi tiếp theo (vòng lặp 0 -> 3)
    operationIndex = (operationIndex + 1) % OPERATION_CYCLE.length;

    let num1, num2, result, question;

    // 2. TẠO BÀI TOÁN TƯƠNG ỨNG VỚI PHÉP TOÁN
    switch (op) {
        case '+':
            num1 = randomInt(1, 20);
            num2 = randomInt(1, 20);
            result = num1 + num2;
            question = `${num1} + ${num2}`;
            break;
        case '-':
            num1 = randomInt(5, 20);
            num2 = randomInt(1, num1);
            result = num1 - num2;
            question = `${num1} - ${num2}`;
            break;
        case '×':
            num1 = randomInt(2, 10);
            num2 = randomInt(2, 10);
            result = num1 * num2;
            question = `${num1} × ${num2}`;
            break;
        case '÷':
            // Đảm bảo kết quả là số nguyên
            num2 = randomInt(2, 10);
            result = randomInt(2, 10);
            num1 = num2 * result;
            question = `${num1} ÷ ${num2}`;
            break;
    }

    return { question, answer: result };
}

// Cập nhật vị trí lá cờ theo biến tugOfWarPosition
function updateRopePosition() {
    if (!flagWrapper) return;
    flagWrapper.style.transform = `translateX(-50%) translateX(${tugOfWarPosition}px)`;
}

// Kiểm tra đội nào thắng
function checkWin() {
    if (tugOfWarPosition <= -MAX_PULL) {
        handleWin(1);
    } else if (tugOfWarPosition >= MAX_PULL) {
        handleWin(2);
    }
}

// Xử lý khi một đội thắng vòng
function handleWin(team) {
    isGameActive = false;

    if (team === 1) {
        scoreTeam1++;
    } else {
        scoreTeam2++;
    }

    scoreEl1.textContent = scoreTeam1;
    scoreEl2.textContent = scoreTeam2;

    modalTitle.textContent = `🎉 ĐỘI ${team} THẮNG VÒNG NÀY! 🎉`;
    modalMessage.textContent = `Tỉ số hiện tại: Đội 1 ${scoreTeam1} : ${scoreTeam2} Đội 2`;
    modal.style.display = 'flex';
}

// Bắt đầu (hoặc bắt đầu lại) một vòng chơi mới
function startGame() {
    isGameActive = true;
    tugOfWarPosition = 0;

    // Đóng modal nếu đang mở
    if (modal) modal.style.display = 'none';

    // Tạo bài toán mới cho cả hai đội
    currentProblem1 = generateProblem();
    currentProblem2 = generateProblem();

    problemEl1.textContent = currentProblem1.question + ' = ?';
    problemEl2.textContent = currentProblem2.question + ' = ?';

    // Reset giao diện
    answerInput1.value = '';
    answerInput2.value = '';
    feedbackEl1.textContent = '';
    feedbackEl2.textContent = '';
    feedbackEl1.className = 'feedback';
    feedbackEl2.className = 'feedback';

    // Đặt lại vị trí dây co về trung tâm
    updateRopePosition();
}

// Kiểm tra đáp án của một đội
function checkAnswer(team) {
    if (!isGameActive) return;

    const answerInput = team === 1 ? answerInput1 : answerInput2;
    const feedbackEl = team === 1 ? feedbackEl1 : feedbackEl2;
    const currentProblem = team === 1 ? currentProblem1 : currentProblem2;

    const value = answerInput.value.trim();
    // VÌ INPUT LÀ TYPE="TEXT", CẦN SANITIZE RÕ RÀNG HƠN
    const sanitizedValue = value.replace(/[^0-9]/g, ''); 
    const userAnswer = Number(sanitizedValue);

    if (sanitizedValue === '') {
        feedbackEl.textContent = 'Hãy nhập một số nhé!';
        feedbackEl.className = 'feedback incorrect';
        return;
    }

    if (userAnswer === currentProblem.answer) {
        feedbackEl.textContent = 'Chính xác! Kéo mạnh nào!';
        feedbackEl.className = 'feedback correct';

        // Kéo dây về phía đội trả lời đúng
        if (team === 1) {
            tugOfWarPosition -= PULL_STRENGTH;
        } else {
            tugOfWarPosition += PULL_STRENGTH;
        }

        updateRopePosition();
        checkWin();

        // Tạo bài toán mới cho đội vừa trả lời
        const newProblem = generateProblem();
        if (team === 1) {
            currentProblem1 = newProblem;
            problemEl1.textContent = newProblem.question + ' = ?';
        } else {
            currentProblem2 = newProblem;
            problemEl2.textContent = newProblem.question + ' = ?';
        }

        answerInput.value = '';
    } else {
        feedbackEl.textContent = 'Chưa đúng rồi, thử lại nhé!';
        feedbackEl.className = 'feedback incorrect';
    }
}

// Gắn sự kiện cho các phím số
function attachNumberPadHandlers() {
    const pads = document.querySelectorAll('.number-pad');

    pads.forEach(pad => {
        const team = pad.dataset.team;
        const input = team === '1' ? answerInput1 : answerInput2;

        pad.querySelectorAll('.num-key').forEach(btn => {
            const digit = btn.dataset.digit;
            const action = btn.dataset.action;

            btn.addEventListener('click', (e) => {
                // *** SỬA LỖI 3: Dùng preventDefault để giữ focus và đọc giá trị ***
                e.preventDefault(); 
                
                if (digit !== undefined) {
                    // Thêm số vào cuối ô nhập
                    input.value = (input.value || '') + digit;
                } else if (action === 'clear') {
                    input.value = '';
                } else if (action === 'back') {
                    input.value = input.value.slice(0, -1);
                }
                // Giữ focus cho input để nó sẵn sàng nhận thêm sự kiện
                input.focus(); 
            });
        });
    });
}

// --- Khởi động game khi tải trang ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Gán các phần tử DOM
    problemEl1 = document.getElementById('problem1');
    problemEl2 = document.getElementById('problem2');
    answerInput1 = document.getElementById('answer1');
    answerInput2 = document.getElementById('answer2');
    feedbackEl1 = document.getElementById('feedback1');
    feedbackEl2 = document.getElementById('feedback2');
    scoreEl1 = document.getElementById('score-team1');
    scoreEl2 = document.getElementById('score-team2');
    flagWrapper = document.querySelector('.rope-line .flag-wrapper');
    modal = document.getElementById('result-modal');
    modalTitle = document.getElementById('modal-title');
    modalMessage = document.getElementById('modal-message');
    newRoundBtn = document.getElementById('new-round-btn');
    nextRoundBtn = document.getElementById('next-round-btn');

    // 2. *** SỬA LỖI CHÍNH: GỌI HÀM GẮN SỰ KIỆN BÀN PHÍM ***
    attachNumberPadHandlers(); 

    // 3. Gán sự kiện cho nút "Kéo Dây!" (SỬ DỤNG SELECTOR VÀ addEventListener CHÍNH XÁC)
    // Sửa Lỗi 1 & 2: Dùng :last-of-type để nhắm đúng nút "Kéo Dây!"
    const pullButton1 = document.querySelector('.team-panel.team1 button:last-of-type');
    const pullButton2 = document.querySelector('.team-panel.team2 button:last-of-type');
    
    // Nút Kéo Dây! Đội 1
    pullButton1.addEventListener('click', (e) => {
        e.preventDefault(); // Ngăn chặn hành vi mặc định, đảm bảo nhận giá trị
        checkAnswer(1);
        answerInput1.focus(); 
    });

    // Nút Kéo Dây! Đội 2
    pullButton2.addEventListener('click', (e) => {
        e.preventDefault(); // Ngăn chặn hành vi mặc định, đảm bảo nhận giá trị
        checkAnswer(2);
        answerInput2.focus(); 
    });

    // 4. Cho phép nhấn Enter để gửi đáp án
    answerInput1.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkAnswer(1);
    });
    answerInput2.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkAnswer(2);
    });
    
    // 5. Nút vòng mới & nút trong modal
    newRoundBtn.addEventListener('click', startGame);
    nextRoundBtn.addEventListener('click', startGame);

    // 6. Bắt đầu vòng đầu tiên
    startGame();
});
