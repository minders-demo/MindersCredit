const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf-8');

const script = `
    <!-- Single Page Apps for GitHub Pages -->
    <script type="text/javascript">
      (function(l) {
        if (l.search[1] === '/' ) {
          var decoded = l.search.slice(1).split('&').map(function(s) { 
            return s.replace(/~and~/g, '&')
          }).join('?');
          window.history.replaceState(null, null,
              l.pathname.slice(0, -1) + decoded + l.hash
          );
        }
      }(window.location))
    </script>
`;

code = code.replace('</head>', script + '  </head>');
fs.writeFileSync('index.html', code);
