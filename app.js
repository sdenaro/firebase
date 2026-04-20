// app.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    initializeFirestore, 
    collection, 
    query, 
    orderBy, 
    startAt, 
    endAt, 
    getDocs 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, {
    experimentalForceLongPolling: true // Crucial for github.dev
});

const searchBtn = document.getElementById('searchBtn');
const titleInput = document.getElementById('titleInput');
const resultsDiv = document.getElementById('results');

async function searchBooks() {
    const searchTerm = titleInput.value.trim();
    if (!searchTerm) {
        resultsDiv.innerHTML = '<p class="no-results">Please enter a title to search.</p>';
        return;
    }

    resultsDiv.innerHTML = '<p class="no-results">Searching the Books collection...</p>';

    try {
        const booksRef = collection(db, "Books");
        const q = query(
            booksRef,
            orderBy("title"),
            startAt(searchTerm),
            endAt(searchTerm + '\uf8ff')
        );

        const querySnapshot = await getDocs(q);
        resultsDiv.innerHTML = '';

        if (querySnapshot.empty) {
            resultsDiv.innerHTML = '<p class="no-results">No books found starting with "' + searchTerm + '".</p>';
            return;
        }

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const bookElement = document.createElement('div');
            bookElement.className = 'book-item';
            bookElement.innerHTML = `
                <div class="book-title">${data.title}</div>
                <div class="book-details">
                    <div><span class="label">Author:</span> ${data.author || 'Unknown'}</div>
                    <div><span class="label">District:</span> ${data.district || 'N/A'}</div>
                    <div><span class="label">State:</span> ${data.state || 'N/A'}</div>
                </div>
            `;
            resultsDiv.appendChild(bookElement);
        });
    } catch (error) {
        console.error("Firestore Search Error:", error);
        resultsDiv.innerHTML = `<p style="color: #d93025; text-align: center;">Error: ${error.message}</p>`;
    }
}

searchBtn.addEventListener('click', searchBooks);
titleInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') searchBooks(); });
