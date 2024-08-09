// Configuración de Firebase (reemplaza con tus propias credenciales)
const firebaseConfig = {
    apiKey: "",
    authDomain: "",
    databaseURL: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
  };

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const database = firebase.database();

const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const addQuestionBtn = document.getElementById('addQuestionBtn');
const questionsContainer = document.getElementById('questions');
const questionForm = document.getElementById('questionForm');
const questionFormElement = document.getElementById('questionFormElement');
const answerForm = document.getElementById('answerForm');
const answerFormElement = document.getElementById('answerFormElement');
const paginationContainer = document.getElementById('pagination');

let currentUser = null;
let currentPage = 1;
let questionsPerPage = 10;
let currentCategory = 'all';

// Autenticación
loginBtn.addEventListener('click', () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
});

logoutBtn.addEventListener('click', () => {
    auth.signOut();
});

auth.onAuthStateChanged((user) => {
    currentUser = user;
    if (user) {
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'block';
        addQuestionBtn.style.display = 'block';
    } else {
        loginBtn.style.display = 'block';
        logoutBtn.style.display = 'none';
        addQuestionBtn.style.display = 'none';
        questionForm.style.display = 'none';
        answerForm.style.display = 'none';
    }
    loadQuestions();
});

// Navegación por categorías
document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        currentCategory = e.target.getAttribute('data-category');
        currentPage = 1;
        loadQuestions();
    });
});

// Gestión de preguntas y respuestas
function loadQuestions() {
    const questionsRef = database.ref('questions');
    questionsRef.once('value', (snapshot) => {
        const allQuestions = [];
        snapshot.forEach((childSnapshot) => {
            const question = childSnapshot.val();
            question.id = childSnapshot.key;
            allQuestions.push(question);
        });

        const filteredQuestions = currentCategory === 'all' 
            ? allQuestions 
            : allQuestions.filter(question => question.category === currentCategory);

        const totalPages = Math.ceil(filteredQuestions.length / questionsPerPage);
        const startIndex = (currentPage - 1) * questionsPerPage;
        const endIndex = startIndex + questionsPerPage;
        const questionsToShow = filteredQuestions.slice(startIndex, endIndex);

        displayQuestions(questionsToShow);
        displayPagination(totalPages);
    });
}

function displayQuestions(questions) {
    questionsContainer.innerHTML = '';
    questions.forEach((question) => {
        createQuestionElement(question);
    });
}

function createQuestionElement(question) {
    const div = document.createElement('div');
    div.className = 'question';
    div.innerHTML = `
        <h2>${question.title}</h2>
        <div class="question-content">${question.content}</div>
        <div class="question-meta">
            Preguntado por ${question.askedBy} | Categoría: ${question.category}
        </div>
       <p>
        <button onclick="toggleAnswers('${question.id}')">Respuestas &#8645;</button>
        ${currentUser ? `<button onclick="showAnswerForm('${question.id}')">Responder</button></p>` : ''}
        <div id="answers-${question.id}" class="answers" style="display: none;"></div>
    `;
    questionsContainer.appendChild(div);
}

function toggleAnswers(questionId) {
    const answersContainer = document.getElementById(`answers-${questionId}`);
    if (answersContainer.style.display === 'none') {
        loadAnswers(questionId);
        answersContainer.style.display = 'block';
    } else {
        answersContainer.style.display = 'none';
    }
}

function loadAnswers(questionId) {
    const answersRef = database.ref(`answers/${questionId}`);
    answersRef.once('value', (snapshot) => {
        const answersContainer = document.getElementById(`answers-${questionId}`);
        answersContainer.innerHTML = '';
        snapshot.forEach((childSnapshot) => {
            const answer = childSnapshot.val();
            const answerElement = document.createElement('div');
            answerElement.className = 'answer';
            answerElement.innerHTML = `
                <div>${answer.content}</div>
                <div class="answer-meta">Respondido por ${answer.answeredBy}</div>
            `;
            answersContainer.appendChild(answerElement);
        });
    });
}

function displayPagination(totalPages) {
    paginationContainer.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.addEventListener('click', () => {
            currentPage = i;
            loadQuestions();
        });
        paginationContainer.appendChild(button);
    }
}

addQuestionBtn.addEventListener('click', () => {
    showQuestionForm();
});

function showQuestionForm() {
    questionForm.style.display = 'block';
}

questionFormElement.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('questionTitle').value;
    const content = document.getElementById('questionContent').value;
    const category = document.getElementById('questionCategory').value;
    
    const questionData = {
        title: title,
        content: content,
        category: category,
        askedBy: currentUser.displayName,
        askedByUid: currentUser.uid,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    };

    database.ref('questions').push(questionData).then(() => {
        questionFormElement.reset();
        questionForm.style.display = 'none';
        loadQuestions();
    });
});

// ... (el resto del código permanece igual) ...

function showAnswerForm(questionId) {
    answerForm.style.display = 'block';
    document.getElementById('answerQuestionId').value = questionId;
    document.getElementById('mainContent').scrollIntoView({ behavior: 'smooth' });
    // Inicializar TinyMCE
    tinymce.init({
        selector: '#answerContent',
        plugins: 'advlist autolink lists link image charmap print preview hr anchor pagebreak',
        toolbar_mode: 'floating',
        height: 300
    });
}

answerFormElement.addEventListener('submit', (e) => {
    e.preventDefault();
    const questionId = document.getElementById('answerQuestionId').value;
    const content = tinymce.get('answerContent').getContent(); // Obtener contenido HTML
    
    const answerData = {
        content: content,
        answeredBy: currentUser.displayName,
        answeredByUid: currentUser.uid,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    };

    database.ref(`answers/${questionId}`).push(answerData).then(() => {
        answerFormElement.reset();
        tinymce.get('answerContent').setContent(''); // Limpiar el editor
        tinymce.remove('#answerContent'); // Remover la instancia de TinyMCE
        answerForm.style.display = 'none';
        loadAnswers(questionId);
    });
});

function loadAnswers(questionId) {
    const answersRef = database.ref(`answers/${questionId}`);
    answersRef.once('value', (snapshot) => {
        const answersContainer = document.getElementById(`answers-${questionId}`);
        answersContainer.innerHTML = '';
        snapshot.forEach((childSnapshot) => {
            const answer = childSnapshot.val();
            const answerElement = document.createElement('div');
            answerElement.className = 'answer';
            answerElement.innerHTML = `
                <div>${answer.content}</div>
                <div class="answer-meta">Respondido por ${answer.answeredBy}</div>
            `;
            answersContainer.appendChild(answerElement);
        });
    });
}

document.getElementById('cancelAnswer').addEventListener('click', () => {
    tinymce.remove('#answerContent'); // Remover la instancia de TinyMCE
    answerForm.style.display = 'none';
});

// ... (el resto del código permanece igual) ...

// Carga inicial de preguntas
loadQuestions();
