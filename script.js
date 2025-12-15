// --- Cấu hình Trò chơi ---
const PULL_STRENGTH = 30; 
const MAX_PULL = 350;     

// ÂM THANH
const SOUND_CORRECT = new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3'); 
const SOUND_WRONG = new Audio('https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3');   
const SOUND_WIN = new Audio('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3');     

function playSound(audio) {
    audio.currentTime = 0;
    audio.play().catch(e => console.log("Audio play prevented."));
}

let tugOfWarPosition = 0; 
let currentProblem1 = { answer: 0 };
let currentProblem2 = { answer: 0 };
let scoreTeam1 = 0;
let scoreTeam2 = 0;
let isGameActive = true;

// BIẾN CHO PHÉP TÍNH
const OPERATION_CYCLE = ['+', '-', '×', '÷'];
let operationIndex = 0; 

// Biến DOM
let problemEl1, problemEl2;
let answerInput1, answerInput2;
let feedbackEl1, feedbackEl2;
let scoreEl1, scoreEl2;
let flagWrapper;
let modal, modalTitle, modalMessage;
let newRoundBtn, nextRoundBtn;

// BIẾN CHO CÀI ĐẶT TÊN & AVATAR
let teamNameInput1, teamNameInput2;
let avatarSelect1, avatarSelect2;
let displayTeamName1, displayTeamName2;
let startGameBtn;
let gameContent;
let teamHeader1, teamHeader2; 

// --- Hàm tiện ích ---
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateProblem() {
    const op = OPERATION_CYCLE[operationIndex];
    operationIndex = (operationIndex + 1) % OPERATION_CYCLE.length;

    let num1, num2, result, question;

    switch (op) {
        case '+':
            num1 = randomInt(1, 25);
            num2 = randomInt(1, 25);
            result = num1 + num2;
            question = `${num1} + ${num2}`;
            break;
        case '-':
            num1 = randomInt(10, 30);
            num2 = randomInt(1, num1 - 1);
            result = num1 - num2;
            question = `${num1} - ${num2}`;
            break;
        case '×':
            num1 = randomInt(2, 10);
            num2 = randomInt(2, 8);
            result = num1 * num2;
            question = `${num1} × ${num2}`;
            break;
        case '÷':
            num2 = randomInt(2, 8);
            result = randomInt(2, 8);
            num1 = num2 * result;
            question = `${num1} ÷ ${num2}`;
            break;
    }

    return { question, answer: result };
}

function updateRopePosition() {
    if (!flagWrapper) return;
    flagWrapper.style.transform = `translateX(-50%) translateX(${tugOfWarPosition}px)`;
}

function checkWin() {
    if (tugOfWarPosition <= -MAX_PULL) {
        handleWin(1);
    } else if (tugOfWarPosition >= MAX_PULL) {
        handleWin(2);
    }
}

function handleWin(team) {
    isGameActive = false;
    playSound(SOUND_WIN); 

    if (team === 1) {
        scoreTeam1++;
    } else {
        scoreTeam2++;
    }

    scoreEl1.textContent = scoreTeam1;
    scoreEl2.textContent = scoreTeam2;
    
    // Lấy tên đội để hiển thị trong Modal
    const winningTeamName = team === 1 ? displayTeamName1.textContent : displayTeamName2.textContent;

    modalTitle.textContent = `🎉 CHÚC MỪNG ${winningTeamName}! 🎉`;
    modalMessage.textContent = `Tỉ số hiện tại: ${displayTeamName1.textContent} ${scoreTeam1} : ${scoreTeam2} ${displayTeamName2.textContent}`;
    modal.style.display = 'flex';
}

function startGame() {
    isGameActive = true;
    tugOfWarPosition = 0;

    if (modal) modal.style.display = 'none';

    // *** SỬA LỖI: ĐẢM BẢO PHÉP TÍNH LUÔN ĐƯỢC GÁN ***
    currentProblem1 = generateProblem();
    currentProblem2 = generateProblem();

    problemEl1.textContent = currentProblem1.question + ' = ?';
    problemEl2.textContent = currentProblem2.question + ' = ?';

    answerInput1.value = '';
    answerInput2.value = '';
    feedbackEl1.textContent = '';
    feedbackEl2.textContent = '';
    feedbackEl1.className = 'feedback';
    feedbackEl2.className = 'feedback';

    updateRopePosition();
}

function checkAnswer(team) {
    if (!isGameActive) return;

    const answerInput = team === 1 ? answerInput1 : answerInput2;
    const feedbackEl = team === 1 ? feedbackEl1 : feedbackEl2;
    const currentProblem = team === 1 ? currentProblem1 : currentProblem2;
    const problemEl = team === 1 ? problemEl1 : problemEl2; // Dùng để gán bài toán mới
    const panel = team === 1 ? document.querySelector('.team1') : document.querySelector('.team2');

    const value = answerInput.value.trim();
    const sanitizedValue = value.replace(/[^0-9-]/g, ''); // Cho phép dấu trừ (nếu cần)
    const userAnswer = Number(sanitizedValue);

    if (sanitizedValue === '') {
        feedbackEl.textContent = 'Hãy nhập một số nhé!';
        feedbackEl.className = 'feedback incorrect';
        return;
    }

    if (userAnswer === currentProblem.answer) {
        // TRẢ LỜI ĐÚNG: KÉO DÂY VÀ HIỆU ỨNG GLOW
        playSound(SOUND_CORRECT);
        panel.classList.add('correct-glow');
        setTimeout(() => panel.classList.remove('correct-glow'), 600);

        feedbackEl.textContent = 'Chính xác! Kéo mạnh nào!';
        feedbackEl.className = 'feedback correct';

        if (team === 1) {
            tugOfWarPosition -= PULL_STRENGTH;
        } else {
            tugOfWarPosition += PULL_STRENGTH;
        }

        updateRopePosition();
        checkWin();

        // TẠO BÀI TOÁN MỚI VÀ GÁN LẠI PROBLEMEL
        const newProblem = generateProblem();
        if (team === 1) {
            currentProblem1 = newProblem;
        } else {
            currentProblem2 = newProblem;
        }
        problemEl.textContent = newProblem.question + ' = ?'; // <--- SỬA LỖI GÁN PHÉP TÍNH

        answerInput.value = '';
    } else {
        // TRẢ LỜI SAI: HIỆU ỨNG RUNG
        playSound(SOUND_WRONG);
        panel.classList.add('shake-anim');
        setTimeout(() => panel.classList.remove('shake-anim'), 400);

        feedbackEl.textContent = 'Chưa đúng rồi, thử lại nhé!';
        feedbackEl.className = 'feedback incorrect';
    }
}

function attachNumberPadHandlers() {
    const pads = document.querySelectorAll('.number-pad');

    pads.forEach(pad => {
        const team = pad.dataset.team;
        const input = team === '1' ? answerInput1 : answerInput2;

        pad.querySelectorAll('.num-key').forEach(btn => {
            const digit = btn.dataset.digit;
            const action = btn.dataset.action;

            btn.addEventListener('click', (e) => {
                e.preventDefault(); 
                
                if (digit !== undefined) {
                    // Giới hạn 4 ký tự cho đáp án
                    if (input.value.length < 4) {
                         input.value = (input.value || '') + digit;
                    }
                } else if (action === 'clear') {
                    input.value = '';
                } else if (action === 'back') {
                    input.value = input.value.slice(0, -1);
                }
                input.focus(); 
            });
        });
    });
}

// *** HÀM MỚI: Cập nhật tên đội và Avatar ***
function initializeGame() {
    // 1. Cập nhật tên hiển thị
    displayTeamName1.textContent = teamNameInput1.value || "Đội 1";
    displayTeamName2.textContent = teamNameInput2.value || "Đội 2";
    teamHeader1.textContent = displayTeamName1.textContent;
    teamHeader2.textContent = displayTeamName2.textContent;

    // 2. Cập nhật Avatar cho tất cả các player blocks
    const avatar1 = avatarSelect1.value;
    const avatar2 = avatarSelect2.value;

    document.querySelectorAll('.player-set-1 .player-block').forEach(p => {
        p.setAttribute('data-avatar', avatar1);
    });
    document.querySelectorAll('.player-set-2 .player-block').forEach(p => {
        p.setAttribute('data-avatar', avatar2);
    });

    // 3. Ẩn khu vực cài đặt và hiển thị khu vực trò chơi
    document.querySelector('.team-setup-container').style.display = 'none';
    gameContent.style.display = 'block';
    gameContent.classList.add('active');
    
    // 4. Bắt đầu vòng chơi
    startGame();
}


// --- Khởi động game khi tải trang ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Gán các phần tử DOM CŨ
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

    // 2. Gán các phần tử DOM MỚI (Cài đặt & Header)
    teamNameInput1 = document.getElementById('teamName1');
    teamNameInput2 = document.getElementById('teamName2');
    avatarSelect1 = document.getElementById('avatarSelect1');
    avatarSelect2 = document.getElementById('avatarSelect2');
    displayTeamName1 = document.getElementById('displayTeamName1');
    displayTeamName2 = document.getElementById('displayTeamName2');
    startGameBtn = document.getElementById('start-game-btn');
    gameContent = document.getElementById('game-content');
    teamHeader1 = document.getElementById('teamHeader1');
    teamHeader2 = document.getElementById('teamHeader2');


    // 3. GỌI HÀM GẮN SỰ KIỆN BÀN PHÍM
    attachNumberPadHandlers(); 

    // 4. Gắn sự kiện cho nút "Kéo Dây!"
    const pullButton1 = document.querySelector('.team-panel.team1 button:last-of-type');
    const pullButton2 = document.querySelector('.team-panel.team2 button:last-of-type');
    
    pullButton1.addEventListener('click', (e) => {
        e.preventDefault(); 
        checkAnswer(1);
        answerInput1.focus(); 
    });

    pullButton2.addEventListener('click', (e) => {
        e.preventDefault();
        checkAnswer(2);
        answerInput2.focus(); 
    });

    // 5. Gắn sự kiện cho nút BẮT ĐẦU CHƠI
    startGameBtn.addEventListener('click', initializeGame);

    // 6. Cho phép nhấn Enter để gửi đáp án
    answerInput1.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            checkAnswer(1);
            e.preventDefault();
        }
    });
    answerInput2.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            checkAnswer(2);
            e.preventDefault();
        }
    });
    
    // 7. Nút vòng mới & nút trong modal
    newRoundBtn.addEventListener('click', startGame);
    nextRoundBtn.addEventListener('click', startGame);

    // Lưu ý: Chúng ta không gọi startGame() ở đây. Nó được gọi bên trong initializeGame().
});
