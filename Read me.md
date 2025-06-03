HTML stands for Hyper text markup language and is used for structuring the content of the webpage.
A markup language used for design and create webpages.
It uses html tags to define all its elements
It serves as the backbone of the website and works alongside css and js to build fully functional and visually appealing webpages.

"mark up” text in a way that tells a computer how to display.
i.e.. markup languages dont perform logic or calculations.

Basic structure of html is like-
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Zeus Task 1 : WebPage</title>
</head>
<body>
    <h1>Welcome to My Web Page</h1>
    <p>This is a basic HTML web page.</p>
</body>
</html>



There are 2 types of html tags- inline and block.
Block tags takes a complete block section, while inline tags works in the same line

Difference Between Inline and Block-Level Elements in HTML
 1. Different Ways to Apply CSS to HTML
There are three main ways to apply CSS:

a) Inline CSS
CSS is written directly inside an HTML element using the style attribute.

<p style="color: red;">This is red text.</p>
✔️ Quick and easy for one-time styling
❌ Not reusable, makes HTML messy

b) Internal CSS
CSS is written inside a <style> tag in the <head> of the HTML document.

<head>
  <style>
    p {
      color: blue;
    }
  </style>
</head>
✔️ Good for single-page projects
❌ Not reusable across multiple pages

c) External CSS (✔️ Preferred way)
CSS is written in a separate .css file and linked in the HTML using <link>.

<link rel="stylesheet" href="styles.css">
✔️ Clean, separates content and design, reusable, scalable
❌ Requires an extra HTTP request


✅ 2. CSS Selectors
CSS selectors are patterns used to select elements to style.

a) Element Selector
Selects HTML tags directly.

p {
  color: green;
}
b) Class Selector
Uses a . prefix. Can be applied to multiple elements.

.green-text {
  color: green;
}
<p class="green-text">Green text</p>

c) ID Selector
Uses a # prefix. Should be unique on the page.

#main-heading {
  font-size: 24px;
}
<h1 id="main-heading">Main Heading</h1>










✅ Ways to Add JavaScript to a Webpage
There are three main ways to add JavaScript to a webpage:

1. Inline JavaScript
JavaScript is written directly in an HTML element using the onclick, onload, etc. attributes.

<button onclick="alert('Hello!')">Click Me</button>
2. Internal JavaScript
JavaScript code is written inside a <script> tag in the same HTML file (usually in the <head> or end of <body>).

<script>
  function greet() {
    alert("Hello!");
  }
</script>
Then you call it with:

<button onclick="greet()">Click Me</button>
3. External JavaScript
JavaScript is written in a separate .js file, which is then linked to the HTML.

<!-- HTML -->
<script src="script.js"></script>

// script.js
function greet() {
  alert("Hello!");
}