const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// === CONFIGURATION ===
const moduleNumber = 1;
const contentPath = path.join(__dirname, '../modules/modules/module1.html');
const outputPath = path.join(__dirname, `../../selezione-frontend/public/formation-selezione-${moduleNumber}.html`);

// === LECTURE DU CONTENU ===
fs.readFile(contentPath, 'utf8', (err, htmlContent) => {
  if (err) {
    console.error('Erreur lecture fichier source :', err);
    process.exit(1);
  }

  // === ÉCRITURE DU FICHIER DANS LE FRONTEND ===
  fs.writeFile(outputPath, htmlContent, 'utf8', (err) => {
    if (err) {
      console.error('Erreur écriture fichier HTML :', err);
      process.exit(1);
    }

    console.log(`✅ Module ${moduleNumber} injecté avec succès dans le frontend.`);

    // === COMMIT + DEPLOIEMENT AUTOMATIQUE ===
    exec(`
      cd ../../selezione-frontend &&
      git add . &&
      git commit -m "Inject module ${moduleNumber}" &&
      git push
    `, (err, stdout, stderr) => {
      if (err) {
        console.error('Erreur lors du push Git :', err);
        return;
      }
      console.log('✅ Modifications poussées vers GitHub.');
      console.log(stdout);
      console.error(stderr);
    });
  });
});
