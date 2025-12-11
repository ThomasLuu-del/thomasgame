// --- Cấu hình Trò chơi ---
const PULL_STRENGTH = 15; // Số pixel kéo mỗi lần đúng.
const MAX_PULL = 150;    // Khoảng cách tối đa (pixel) để thắng.

let tugOfWarPosition = 0; // Vị trí kéo co (0 là trung tâm, âm: Đội 1, dương: Đội 2)
let currentProblem1 = { answer: 0 };
let currentProblem2 = { answer: 0 };
let scoreTeam1 = 0;
let scoreTeam2 = 0;
let isGameActive = true;

// --- DOM Elements (Đã sửa để dùng center-marker) ---
const ropeEl = document.getElementById('center-marker'); // Đây là phần tử bao bọc di chuyển
const problemEl1 = document.getElementById('problem1');
const problemEl2 = document.getElementById('problem2');
const answerInput1 = document.getElementById('answer1');
const answerInput2 = document.getElementById('answer2');
const feedbackEl1 = document.getElementById('feedback1');
const feedbackEl2 = document.getElementById('feedback2');
const scoreEl1 = document.getElementById('score-team1');
const scoreEl2 = document.getElementById('score-team2');
const modal = document.getElementById('winner-modal');
const winnerMessage = document.getElementById('winner-message');

// --- Hàm tạo bài toán ngẫu nhiên (Cộng/Trừ/Nhân/Chia) ---
function generateProblem() {
    // Cấu hình giới hạn
    const ADD_SUB_RANGE = 40;     // Giới hạn số cho Cộng/Trừ (1-40)
    const MULT_DIV_LIMIT = 10;    // Giới hạn tối đa cho thừa số/số chia (1-10)
    
    // Chọn ngẫu nhiên 1 trong 4 phép toán
    const operators = ['+', '-', '*', '/'];
    const operator = operators[Math.floor(Math.random() * operators.length)];

    let num1, num2, question, answer;

    switch (operator) {
        case '+':
            num1 = Math.floor(Math.random() * ADD_SUB_RANGE) + 1;
            num2 = Math.floor(Math.random() * ADD_SUB_RANGE) + 1;
            question = `${num1} + ${num2}`;
            answer = num1 + num2;
            break;
            
        case '-':
            // Đảm bảo kết quả phép trừ không âm
            num1 = Math.floor(Math.random() * ADD_SUB_RANGE) + 1;
            num2 = Math.floor(Math.random() * ADD_SUB_RANGE) + 1;
            if (num1 < num2) [num1, num2] = [num2, num1];
            question = `${num1} - ${num2}`;
            answer = num1 - num2;
            break;
            
        case '*':
            // Phép nhân (Dùng ký hiệu ×)
            num1 = Math.floor(Math.random() * MULT_DIV_LIMIT) + 1;
            num2 = Math.floor(Math.random() * MULT_DIV_LIMIT) + 1;
            question = `${num1} × ${num2}`;
            answer = num1 * num2;
            break;
            
        case '/':
            // Phép chia (Dùng ký hiệu ÷)
            let result = Math.floor(Math.random() * MULT_DIV_LIMIT) + 1; 
            num2 = Math.floor(Math.random() * MULT_DIV_LIMIT) + 1;     
            num1 = result * num2; 

            question = `${num1} ÷ ${num2}`;
            answer = result;
            break;
    }

    return { question, answer };
}

// --- Khởi tạo/Thiết lập vòng chơi mới ---
function startGame() {
    isGameActive = true;
    tugOfWarPosition = 0;
    
    // Đóng Modal (nếu đang mở)
    modal.style.display = 'none';

    // Tạo bài toán mới
    currentProblem1 = generateProblem();
    currentProblem2 = generateProblem();

    // Hiển thị bài toán
    problemEl1.textContent = currentProblem1.question + ' = ?';
    problemEl2.textContent = currentProblem2.question + ' = ?';

    // Reset giao diện và đầu vào
    answerInput1.value = '';
    answerInput2.value = '';
    feedbackEl1.textContent = '';
    feedbackEl2.textContent = '';
    
    // Đặt lại vị trí dây co về trung tâm
    updateRopePosition();
}

// --- Cập nhật vị trí dây co trên giao diện ---
function updateRopePosition() {
    // Dịch chuyển phần tử center-marker (chứa dây thừng và cờ)
    ropeEl.style.transform = `translateX(${tugOfWarPosition}px)`;
}

// --- Kiểm tra đáp án khi người chơi nhấn nút ---
function checkAnswer(team) {
    if (!isGameActive) return;

    let input, problem, feedbackEl;

    if (team === 1) {
        input = answerInput1;
        problem = currentProblem1;
        feedbackEl = feedbackEl1;
    } else { // team === 2
        input = answerInput2;
        problem = currentProblem2;
        feedbackEl = feedbackEl2;
    }
    
    const userAnswer = parseInt(input.value);

    if (isNaN(userAnswer) || input.value === '') {
        feedbackEl.textContent = 'Vui lòng nhập đáp án!';
        feedbackEl.className = 'feedback incorrect';
        return;
    }

    // So sánh đáp án
    if (userAnswer === problem.answer) {
        feedbackEl.textContent = 'CHÍNH XÁC! Kéo dây!';
        feedbackEl.className = 'feedback correct';
        
        // Cập nhật vị trí kéo co
        if (team === 1) {
            tugOfWarPosition -= PULL_STRENGTH; // Đội 1 kéo sang trái (Âm)
        } else {
            tugOfWarPosition += PULL_STRENGTH; // Đội 2 kéo sang phải (Dương)
        }

        // Tạo bài toán mới ngay lập tức cho đội vừa trả lời đúng
        if (team === 1) {
            currentProblem1 = generateProblem();
            problemEl1.textContent = currentProblem1.question + ' = ?';
            input.value = ''; 
        } else {
            currentProblem2 = generateProblem();
            problemEl2.textContent = currentProblem2.question + ' = ?';
            input.value = ''; 
        }
        
        // Cập nhật vị trí và kiểm tra thắng
        updateRopePosition();
        checkWinCondition(team); 
        
    } else {
        feedbackEl.textContent = 'SAI! Thử lại.';
        feedbackEl.className = 'feedback incorrect';
    }
}

// --- Kiểm tra điều kiện thắng vòng ---
function checkWinCondition() {
    const absPosition = Math.abs(tugOfWarPosition);

    if (absPosition >= MAX_PULL) {
        isGameActive = false; // Ngừng game
        
        let winner;
        if (tugOfWarPosition <= -MAX_PULL) {
            winner = 1;
            scoreTeam1++;
            winnerMessage.textContent = '🎉 ĐỘI 1 THẮNG VÒNG NÀY! 🎉';
            winnerMessage.className = 'score-team1';
        } else if (tugOfWarPosition >= MAX_PULL) {
            winner = 2;
            scoreTeam2++;
            winnerMessage.textContent = '🎉 ĐỘI 2 THẮNG VÒNG NÀY! 🎉';
            winnerMessage.className = 'score-team2';
        }

        // Cập nhật điểm và hiển thị Modal
        scoreEl1.textContent = scoreTeam1;
        scoreEl2.textContent = scoreTeam2;
        modal.style.display = 'block';
    }
}

// --- Khởi động game khi tải trang ---
document.addEventListener('DOMContentLoaded', () => {
    // Gán lại các event listeners (vì onclick đã có trong HTML, nhưng thêm lại không thừa)
    document.querySelector('.team-panel.team1 button').onclick = () => checkAnswer(1);
    document.querySelector('.team-panel.team2 button').onclick = () => checkAnswer(2);
    
    // Thêm chức năng nhấn Enter để gửi đáp án
    answerInput1.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkAnswer(1);
    });
    answerInput2.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkAnswer(2);
    });
    
    startGame();
});