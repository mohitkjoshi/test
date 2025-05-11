// app.js
let socket;
// let userID = localStorage.getItem('userID');
// let userName = localStorage.getItem('userName');
let userID = 'test_user_001';
let userName = 'Test User';
window.onload = () => {
  //document.getElementById('signInBtn').onclick = handleSignIn;
  document.getElementById('refreshBtn').onclick = fetchNews;

  socket = new WebSocket('wss://ws.yourtake.org:443/ws');
  socket.onmessage = handleMessage;
  socket.onopen = () => {

    fetchNews(); // 🚀 Load news directly

    // if (userID) {
    //   sendUserID(userID);
    // }
  };
};

function handleSignIn() {
  userID = 'user_' + Date.now();
  userName = 'User_' + Math.floor(Math.random() * 1000);
  localStorage.setItem('userID', userID);
  localStorage.setItem('userName', userName);
  sendUserInfo();
}

function sendUserInfo() {
  socket.send(JSON.stringify({
    type: 'USER_SIGN_IN',
    user_id: userID,
    user_name: userName,
    id_token: 'mock-token'
  }));
}

function sendUserID(userID) {
  socket.send(JSON.stringify({
    type: 'FACE_ID_LOGIN',
    user_id: userID
  }));
}

function fetchNews() {
  socket.send(JSON.stringify({ type: 'GET_NEWS_ITEMS' }));
}

function fetchComments(newsID) {
  socket.send(JSON.stringify({ type: 'GET_COMMENTS', news_id: newsID }));
}

function handleMessage(event) {
  const msg = JSON.parse(event.data);

  if (msg.type === 'USER_SIGN_IN' && msg.status === 'SUCCESS') {
    document.getElementById('loginSection').style.display = 'none';
    fetchNews();
  }

  if (msg.type === 'GET_NEWS_ITEMS') {
    renderNews(msg.news);
  }

  if (msg.type === 'GET_COMMENTS') {
    renderComments(msg.news_id, msg.comments);
  }
}

function renderNews(newsItems) {
  const container = document.getElementById('newsContainer');
  container.innerHTML = '';

  newsItems.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card text-white p-3';
    card.innerHTML = `
      <h5>${item.title}</h5>
      <p>${item.body}</p>
      <small>By ${item.user_name} • ${item.timestamp}</small>
      <div class="mt-2">
        <button class="btn btn-sm btn-outline-light" onclick="toggleComments(${item.id})">View Comments</button>
        <div class="mt-2">
          <textarea class="form-control bg-dark text-white comment-textarea" id="newComment${item.id}" rows="2" placeholder="Write a comment..."></textarea>
          <button class="btn btn-light btn-sm mt-1" onclick="submitComment(${item.id})">Post</button>
        </div>
        <div id="comments${item.id}" class="mt-3"></div>
      </div>
    `;
    container.appendChild(card);
  });
}

function submitComment(newsID) {
  const text = document.getElementById(`newComment${newsID}`).value;
  if (!text.trim()) return;
  const commentID = crypto.randomUUID();

  socket.send(JSON.stringify({
    type: 'ADD_COMMENT',
    id: commentID,
    news_id: newsID,
    user_id: userID,
    user_name: userName,
    text: text
  }));

  document.getElementById(`newComment${newsID}`).value = '';
  fetchComments(newsID);
}

function toggleComments(newsID) {
  fetchComments(newsID);
}

function renderComments(newsID, comments) {
  const container = document.getElementById(`comments${newsID}`);
  container.innerHTML = '';
  const topComments = comments.filter(c => !c.parent_id);

  topComments.forEach(comment => {
    const commentDiv = document.createElement('div');
    commentDiv.className = 'border rounded p-2 mb-2';
    commentDiv.innerHTML = `
      <strong>${comment.user_name}</strong>
      <p>${comment.text}</p>
      <small>${comment.timestamp}</small>
      <div class="text-end">
        <button class="btn btn-sm btn-outline-light" onclick="showReplyInput('${comment.id}', ${newsID})">Reply</button>
        <div id="replyBox${comment.id}" class="mt-2"></div>
      </div>
    `;
    container.appendChild(commentDiv);

    const replies = comments.filter(c => c.parent_id === comment.id);
    replies.forEach(reply => {
      const replyDiv = document.createElement('div');
      replyDiv.className = 'ms-4 p-2 border rounded text-white bg-dark';
      replyDiv.innerHTML = `
        <strong>${reply.user_name}</strong>
        <p>${reply.text}</p>
        <small>${reply.timestamp}</small>
      `;
      container.appendChild(replyDiv);
    });
  });
}

function showReplyInput(parentID, newsID) {
  const container = document.getElementById(`replyBox${parentID}`);
  container.innerHTML = `
    <textarea class="form-control bg-dark text-white" id="replyText${parentID}" rows="2" placeholder="Write a reply..."></textarea>
    <button class="btn btn-primary btn-sm mt-1" onclick="submitReply('${parentID}', ${newsID})">Reply</button>
  `;
}

function submitReply(parentID, newsID) {
  const text = document.getElementById(`replyText${parentID}`).value;
  if (!text.trim()) return;
  const commentID = crypto.randomUUID();

  socket.send(JSON.stringify({
    type: 'ADD_COMMENT',
    id: commentID,
    news_id: newsID,
    parent_id: parentID,
    user_id: userID,
    user_name: userName,
    text: text
  }));

  fetchComments(newsID);
}
