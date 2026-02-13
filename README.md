# Asociația Pompierilor Români - Portal Membri

Portal web pentru Asociația Pompierilor Români cu sistem de autorizare prin cod QR pentru beneficii și reduceri.

## Funcționalități

- 🚒 **Prezentare Asociație**: Pagină de prezentare profesională
- 📱 **Autorizare QR**: Generare și verificare coduri QR pentru membri
- 💳 **Reduceri**: Sistem de gestionare reduceri de la parteneri
- 🔒 **Bază de Date**: Stocare securizată a certificatelor electronice
- 👤 **Profiluri Membri**: Gestionare date personale și istoric verificări

## Tehnologii Utilizate

- **Backend**: Node.js + Express
- **Bază de Date**: SQLite
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Librării**: QRCode.js pentru generare coduri QR

## Instalare

### Cerințe

- Node.js 14.x sau mai nou
- npm sau yarn

### Pași

1. Clonați repository-ul:
```bash
git clone https://github.com/rmocanu001/asociatia-pompierilor-romani.git
cd asociatia-pompierilor-romani
```

2. Instalați dependențele:
```bash
npm install
```

3. Pornirea serverului:
```bash
npm start
```

Serverul va porni pe `http://localhost:3000`

### Mod Dezvoltare

Pentru mod dezvoltare cu auto-restart:
```bash
npm run dev
```

## Utilizare

### Pentru Membri

1. **Înregistrare**: Accesați secțiunea "Înregistrare" și completați formularul cu:
   - Nume complet
   - Email
   - Telefon (opțional)
   - Număr certificat electronic

2. **Generare QR**: După înregistrare, veți primi un cod QR unic

3. **Descărcare QR**: Salvați codul QR pentru a-l prezenta la parteneri

4. **Acces Profil**: Folosiți ID-ul de membru pentru a accesa profilul

### Pentru Parteneri

1. Accesați secțiunea "Verificare QR"
2. Scanați/introduceți datele QR de la membru
3. Verificați validitatea apartenenței la asociație
4. Acordați reducerea corespunzătoare

### Pentru Administratori

1. **Adăugare Reduceri**: În secțiunea "Reduceri" puteți adăuga noi parteneri și procentaje de reducere

## API Endpoints

### Membri

- `GET /api/members` - Lista tuturor membrilor activi
- `POST /api/members/register` - Înregistrare membru nou
- `GET /api/members/:id` - Detalii membru
- `GET /api/members/:id/verifications` - Istoric verificări membru

### Verificare

- `POST /api/verify` - Verificare cod QR

### Reduceri

- `GET /api/discounts` - Lista reducerilor active
- `POST /api/discounts` - Adăugare reducere nouă

## Structura Proiectului

```
.
├── server/
│   ├── index.js          # Server principal Express
│   └── database.js       # Configurare și schema SQLite
├── public/
│   ├── index.html        # Interfață utilizator
│   ├── styles.css        # Stiluri CSS
│   └── app.js            # Logică client-side
├── package.json
└── README.md
```

## Securitate

- Certificatele electronice sunt stocate securizat în baza de date
- Fiecare membru primește un ID unic (UUID)
- Codurile QR conțin date criptate JSON
- Verificările sunt loggate pentru audit

## Contribuție

Pentru a contribui la proiect:
1. Fork repository-ul
2. Creați un branch pentru feature (`git checkout -b feature/NovaFunctionalitate`)
3. Commit schimbările (`git commit -am 'Adaugă funcționalitate'`)
4. Push pe branch (`git push origin feature/NovaFunctionalitate`)
5. Deschideți un Pull Request

## Licență

ISC

## Contact

Pentru întrebări și suport, contactați Asociația Pompierilor Români.

