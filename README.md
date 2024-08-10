<!-- wp:heading -->
<h2 class="wp-block-heading">¿Cómo puedo empezar a usarla?</h2>
<!-- /wp:heading -->

<!-- wp:list {"ordered":true} -->
<ol class="wp-block-list"><!-- wp:list-item -->
<li>Visita <a href="https://firestore-c15f8.web.app/" target="_blank" rel="noreferrer noopener">https://firestore-c15f8.web.app/</a></li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li>Inicia sesión con tu cuenta de Google.</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li>Explora las preguntas existentes o crea una nueva.</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li>Responde a las preguntas utilizando el editor TinyMCE.</li>
<li>Visita <a href="https://firestore-c15f8.web.app/" target="_blank" rel="noreferrer noopener">https://firestore-c15f8.web.app/</a></li>
<!-- /wp:list-item --></ol>
<!-- /wp:list -->

<!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">Reglas para Realtime Database</h3>
<!-- /wp:heading -->

<!-- wp:code -->
<pre class="wp-block-code"><code>{
  "rules": {
    ".read": false,
    ".write": false,
    "questions": {
      ".read": true,
      ".write": "auth != null",
      "$questionId": {
        ".validate": "newData.hasChildren(&#91;'title', 'content', 'category', 'askedBy', 'askedByUid', 'timestamp'])",
        "title": { ".validate": "newData.isString() &amp;&amp; newData.val().length > 0 &amp;&amp; newData.val().length &lt;= 200" },
        "content": { ".validate": "newData.isString() &amp;&amp; newData.val().length > 0" },
        "category": { ".validate": "newData.isString() &amp;&amp; newData.val().length > 0" },
        "askedBy": { ".validate": "newData.isString() &amp;&amp; newData.val() == auth.token.name" },
        "askedByUid": { ".validate": "newData.val() == auth.uid" },
        "timestamp": { ".validate": "newData.val() &lt;= now" }
      }
    },
    "answers": {
      "$questionId": {
        ".read": true,
        ".write": "auth != null",
        "$answerId": {
          ".validate": "newData.hasChildren(&#91;'content', 'answeredBy', 'answeredByUid', 'timestamp'])",
          "content": { ".validate": "newData.isString() &amp;&amp; newData.val().length > 0" },
          "answeredBy": { ".validate": "newData.isString() &amp;&amp; newData.val() == auth.token.name" },
          "answeredByUid": { ".validate": "newData.val() == auth.uid" },
          "timestamp": { ".validate": "newData.val() &lt;= now" }
        }
      }
    }
  }
}</code></pre>
<!-- /wp:code -->

