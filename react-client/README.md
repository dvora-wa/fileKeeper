# FileKeeper - מערכת ניהול קבצים מתקדמת

מערכת מתקדמת לניהול קבצים ותמונות בענן עם ממשק משתמש חדשני ותמיכה מלאה בעברית.

## ✨ תכונות עיקריות

- 🔐 מערכת אימות מאובטחת עם JWT
- 📁 ניהול תיקיות היררכי עם צבעים מותאמים אישית
- 📤 העלאת קבצים עם Drag & Drop
- 🔍 חיפוש מתקדם וסינון קבצים
- 💾 אחסון מאובטח ב-Amazon S3
- 📊 מעקב אחר שימוש באחסון
- 🌐 תמיכה מלאה בעברית (RTL)
- 📱 עיצוב רספונסיבי לכל המכשירים

## 🛠 טכנולוגיות

### Frontend
- **React 18** - ספריית UI מודרנית
- **Vite** - כלי בנייה מהיר
- **Tailwind CSS** - עיצוב עם utility classes
- **React Query** - ניהול state ו-cache
- **React Hook Form** - ניהול טפסים
- **React Router** - ניווט בין דפים
- **React Dropzone** - העלאת קבצים
- **Headless UI** - רכיבי UI נגישים
- **Lucide React** - אייקונים מודרניים

### Backend Integration
- **.NET 9 API** - שרת Backend
- **PostgreSQL** - בסיס נתונים
- **Amazon S3** - אחסון קבצים
- **JWT Authentication** - אימות מאובטח

## 🚀 התקנה והפעלה

### דרישות מקדימות
- Node.js 18+ 
- npm או yarn
- שרת Backend פעיל (.NET 9)

### שלבי התקנה

1. **שכפול הפרויקט**
```bash
git clone <repository-url>
cd filekeeper-client
```

2. **התקנת dependencies**
```bash
npm install
# או
yarn install
```

3. **הגדרת משתני סביבה**
```bash
cp .env.example .env
```

ערוך את קובץ `.env`:
```bash
VITE_API_URL=http://localhost:5000/api
```

4. **הפעלת שרת הפיתוח**
```bash
npm run dev
# או
yarn dev
```

5. **פתיחת האפליקציה**
הפרויקט יפעל על: `http://localhost:3000`

## 📁 מבנה הפרויקט

```
src/
├── components/          # רכיבים מותקפים
│   ├── Layout.jsx      # מבנה הדף הכללי
│   ├── Header.jsx      # כותרת האפליקציה
│   ├── Sidebar.jsx     # תפריט צד
│   ├── Modals.jsx      # חלונות מודליים
│   └── LoadingSpinner.jsx
├── contexts/           # React Contexts
│   └── AuthContext.jsx # ניהול אימות
├── pages/              # דפי האפליקציה
│   ├── auth/          # דפי אימות
│   ├── Dashboard.jsx   # דף הבית
│   ├── Files.jsx      # ניהול קבצים
│   ├── Search.jsx     # חיפוש קבצים
│   └── Profile.jsx    # פרופיל משתמש
├── services/          # שירותי API
│   └── api.js         # קריאות שרת
├── App.jsx            # רכיב ראשי
├── main.jsx           # נקודת כניסה
└── index.css          # סגנונות גלובליים
```

## 🔧 הגדרות נוספות

### Proxy עבור API
הפרויקט מוגדר עם proxy אוטומטי ל-API בפיתוח:
```javascript
// vite.config.js
server: {
  proxy: {
    '/api': 'http://localhost:5000'
  }
}
```

### RTL Support
האפליקציה תומכת באופן מלא בעברית:
- `dir="rtl"` ב-HTML
- פונטים מותאמים (Assistant, Rubik)
- סגנונות מותאמים ל-RTL

## 📋 פקודות זמינות

```bash
# הפעלת שרת פיתוח
npm run dev

# בנייה לפרודקשן
npm run build

# תצוגה מקדימה של בנייה
npm run preview

# בדיקת קוד
npm run lint
```

## 🔒 אימות ואבטחה

### JWT Tokens
- Token נשמר ב-localStorage
- Refresh אוטומטי לפני פקיעה
- הפניה אוטומטית ל-login כשהטוקן פג

### הרשאות
- משתמש רגיל: ניהול קבצים אישיים
- מנהל: גישה לכל הפונקציות

## 📤 העלאת קבצים

### שיטות העלאה
1. **Drag & Drop** - גרירה ושחרור
2. **לחיצה לבחירה** - דרך file picker
3. **העלאה ישירה** - דרך השרת
4. **Pre-signed URLs** - העלאה ישירה ל-S3

### הגבלות
- גודל מקסימלי: 100MB לקובץ
- סוגי קבצים נתמכים: תמונות, וידאו, מסמכים, ארכיונים

## 🔍 חיפוש וסינון

### אפשרויות חיפוש
- חיפוש לפי שם קובץ
- סינון לפי סוג קובץ
- טווח תאריכים
- מיון לפי גודל/תאריך/שם

## 📊 מעקב ביצועים

### React Query
- Cache אוטומטי לקריאות API
- Background refetch
- Optimistic updates
- Error handling מתקדם

### Loading States
- Skeleton loaders
- Progress indicators
- Error boundaries

## 🎨 עיצוב ונושאים

### Tailwind CSS
- Utility-first approach
- רספונסיבי מלא
- Dark mode support (עתידי)
- אנימציות חלקות

### צבעי מותג
```css
primary: #3B82F6 (כחול)
secondary: #64748B (אפור)
success: #10B981 (ירוק)
danger: #EF4444 (אדום)
warning: #F59E0B (כתום)
```

## 🐛 פתרון בעיות

### בעיות נפוצות

1. **שגיאת CORS**
   - וודא ששרת ה-Backend פועל
   - בדוק הגדרות CORS בשרת

2. **בעיות אימות**
   - נקה localStorage
   - רענן דפדפן
   - בדוק תקינות Token

3. **העלאת קבצים נכשלת**
   - בדוק הגדרות S3
   - וודא הרשאות משתמש
   - בדוק גודל קובץ

### לוגים
```bash
# הפעל עם לוגים מפורטים
npm run dev -- --debug
```

## 📈 שיפורים עתידיים

- [ ] מצב חשוך (Dark Mode)
- [ ] שיתוף קבצים עם משתמשים אחרים
- [ ] תגיות ומטאדאטה מתקדמת
- [ ] גרסאות קבצים
- [ ] אינטגרציה עם Google Drive
- [ ] אפליקציה ניידת
- [ ] עיבוד תמונות (thumbnails)
- [ ] גיבוי אוטומטי

## 🤝 תרומה לפרויקט

1. Fork את הפרויקט
2. צור branch חדש (`git checkout -b feature/amazing-feature`)
3. Commit השינויים (`git commit -m 'Add amazing feature'`)
4. Push ל-branch (`git push origin feature/amazing-feature`)
5. פתח Pull Request

## 📝 רישיון

הפרויקט מופץ תחת רישיון MIT. ראה `LICENSE` לפרטים נוספים.

## 📞 תמיכה

לתמיכה טכנית או שאלות:
- צור issue ב-GitHub
- שלח מייל לצוות הפיתוח
- הצטרף לקהילה ב-Discord

---

**בנוי עם ❤️ על ידי צוות FileKeeper**