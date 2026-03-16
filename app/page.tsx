export default function Home() {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>World Clock & Calendar</title>
        <style dangerouslySetInnerHTML={{ __html: `
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
            background: #0a0a0a;
            color: #f0f0f0;
            min-height: 100vh;
          }
          .container {
            background: #0a0a0a;
            width: 100%;
          }
          .section {
            border-bottom: 1px solid #222;
          }
          .section h2 {
            color: #818cf8;
            font-size: 72px;
            padding: 20px 20px 0;
            border-bottom: 2px solid #1e1e2e;
            background: #111;
          }
          .time-row, .date-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 14px 20px;
            border-bottom: 1px solid #1a1a1a;
          }
          .time-row:last-child, .date-row:last-child {
            border-bottom: none;
          }
          .label {
            font-weight: 700;
            color: #9ca3af;
            font-size: 60px;
          }
          .value {
            font-size: 72px;
            color: #ffffff;
            font-weight: 600;
          }
          .bengali {
            font-size: 64px;
          }
          /* iPad landscape */
          @media (max-width: 1024px) {
            .section h2 { font-size: 64px; padding: 20px 30px 12px; }
            .time-row, .date-row { padding: 24px 30px; }
            .label { font-size: 52px; }
            .value { font-size: 64px; }
            .bengali { font-size: 56px; }
          }
          /* iPad portrait */
          @media (max-width: 768px) {
            .section h2 { font-size: 48px; padding: 16px 20px 10px; }
            .time-row, .date-row { padding: 20px; }
            .label { font-size: 40px; }
            .value { font-size: 48px; }
            .bengali { font-size: 42px; }
          }
          /* Phones */
          @media (max-width: 480px) {
            .section h2 { font-size: 32px; padding: 12px 16px 8px; }
            .time-row, .date-row { padding: 14px 16px; }
            .label, .value { font-size: 28px; }
            .bengali { font-size: 26px; }
          }
        `}} />
      </head>
      <body>
        <div className="container">

          <div className="section">
            <h2>⏰</h2>
            <div className="time-row">
              <span className="label">Dhaka</span>
              <span className="value" id="dhaka-time">--:--:--</span>
            </div>
            <div className="time-row">
              <span className="label">London</span>
              <span className="value" id="london-time">--:--:--</span>
            </div>
            <div className="time-row">
              <span className="label">Sydney</span>
              <span className="value" id="sydney-time">--:--:--</span>
            </div>
          </div>

          <div className="section">
            <h2>📅</h2>
            <div className="date-row">
              <span className="label">English</span>
              <span className="value" id="english-date">--</span>
            </div>
            <div className="date-row">
              <span className="label bengali">বাংলা (Bengali)</span>
              <span className="value bengali" id="bengali-date">--</span>
            </div>
            <div className="date-row">
              <span className="label">Hijri (Islamic)</span>
              <span className="value" id="hijri-date">--</span>
            </div>
          </div>
        </div>

        <script dangerouslySetInnerHTML={{ __html: `
          // ── Bengali calendar data ──────────────────────────────────────────
          // Bangla Academy revised calendar (1987): 12 fixed months
          // Boishakh–Bhadro = 31 days, Ashwin–Magh = 30 days,
          // Falgun = 29 days (30 in leap), Chaitra = always 31 days.
          // Bengali New Year = April 14 of Gregorian year G.
          // Bengali year X = G − 593 (for date ≥ Apr 14) or G − 594 (before Apr 14).
          // "Leap" if Gregorian year (bengaliYear + 594), which contains Falgun, is a leap year.
          var banglaMonthNames = ['বৈশাখ','জ্যৈষ্ঠ','আষাঢ়','শ্রাবণ','ভাদ্র','আশ্বিন','কার্তিক','অগ্রহায়ণ','পৌষ','মাঘ','ফাল্গুন','চৈত্র'];
          var bengaliDigits   = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
          var hijriMonthNames = ['Muharram','Safar',"Rabi' al-Awwal","Rabi' al-Thani",'Jumada al-Awwal','Jumada al-Thani','Rajab',"Sha'ban",'Ramadan','Shawwal',"Dhu al-Qi'dah",'Dhu al-Hijjah'];

          function toBengaliNumber(num) {
            return String(num).split('').map(function(ch) {
              var n = parseInt(ch);
              return isNaN(n) ? ch : bengaliDigits[n];
            }).join('');
          }

          // Returns "DD MonthName YYYY" in Bengali script using the proper Bengali solar calendar.
          function getBengaliDate(date) {
            var monthDays = [31,31,31,31,31,30,30,30,30,30,29,31]; // base (non-leap)
            var y = date.getFullYear();
            var m = date.getMonth();
            var d = date.getDate();

            var newYearThis = new Date(y,     3, 14); // April 14 this year
            var newYearPrev = new Date(y - 1, 3, 14); // April 14 last year
            var today       = new Date(y, m, d);

            var banglaYear, dayIndex;
            if (today >= newYearThis) {
              banglaYear = y - 593;
              dayIndex   = Math.round((today - newYearThis) / 86400000);
            } else {
              banglaYear = y - 594;
              dayIndex   = Math.round((today - newYearPrev) / 86400000);
            }

            // Falgun (index 10) spans Feb–Mar of Gregorian year (banglaYear + 594).
            // If that year is a Gregorian leap year, Feb has 29 days → Falgun = 30 days.
            var falgunYear = banglaYear + 594;
            var isLeap = (falgunYear % 4 === 0 && falgunYear % 100 !== 0) || (falgunYear % 400 === 0);
            if (isLeap) monthDays[10] = 30;

            var banglaMonth = 0;
            var rem = dayIndex;
            while (banglaMonth < 11 && rem >= monthDays[banglaMonth]) {
              rem -= monthDays[banglaMonth];
              banglaMonth++;
            }

            return toBengaliNumber(rem + 1) + ' ' + banglaMonthNames[banglaMonth] + ' ' + toBengaliNumber(banglaYear);
          }

          // Returns the exact Hijri date for Dhaka using the Umm al-Qura calendar via Intl API.
          // Falls back to a mathematical approximation if the Intl calendar extension is unavailable.
          function getHijriDate(date) {
            try {
              var parts = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
                day: 'numeric', month: 'numeric', year: 'numeric',
                timeZone: 'Asia/Dhaka'
              }).formatToParts(date);
              var hDay = 1, hMonth = 1, hYear = 1;
              for (var i = 0; i < parts.length; i++) {
                if      (parts[i].type === 'day')   hDay   = parseInt(parts[i].value);
                else if (parts[i].type === 'month') hMonth = parseInt(parts[i].value);
                else if (parts[i].type === 'year')  hYear  = parseInt(parts[i].value);
              }
              return hDay + ' ' + hijriMonthNames[hMonth - 1] + ' ' + hYear + ' AH';
            } catch (e) {
              // Mathematical fallback (approximate ±1 day)
              var day   = date.getDate();
              var month = date.getMonth() + 1; // 1-based
              var year  = date.getFullYear();
              var jd = Math.floor((1461*(year+4800+Math.floor((month-14)/12)))/4) +
                       Math.floor((367*(month-2-12*Math.floor((month-14)/12)))/12) -
                       Math.floor((3*Math.floor((year+4900+Math.floor((month-14)/12))/100))/4) +
                       day - 32075;
              var l = jd - 1948440 + 10632;
              var n = Math.floor((l-1)/10631);
              l = l - 10631*n + 354;
              var j = Math.floor((10985-l)/5316)*Math.floor((50*l)/17719) +
                      Math.floor(l/5670)*Math.floor((43*l)/15238);
              l = l - Math.floor((30-j)/15)*Math.floor((17719*j)/50) -
                      Math.floor(j/16)*Math.floor((15238*j)/43) + 29;
              var fhMonth = Math.floor((24*l)/709);
              var fhDay   = l - Math.floor((709*fhMonth)/24);
              var fhYear  = 30*n + j - 30;
              return fhDay + ' ' + hijriMonthNames[fhMonth-1] + ' ' + fhYear + ' AH';
            }
          }

          function formatTime(date, timeZone) {
            try {
              return date.toLocaleTimeString('en-US', {
                timeZone: timeZone, hour12: true,
                hour: '2-digit', minute: '2-digit', second: '2-digit'
              });
            } catch (e) {
              var utcTime = date.getTime() + (date.getTimezoneOffset() * 60000);
              var offsets = { 'Asia/Dhaka': 6*60, 'Europe/London': 0, 'Australia/Sydney': 11*60 };
              var localDate = new Date(utcTime + ((offsets[timeZone] || 0) * 60000));
              var hours = localDate.getHours(), minutes = localDate.getMinutes(), seconds = localDate.getSeconds();
              var ampm = hours >= 12 ? 'PM' : 'AM';
              hours = hours % 12 || 12;
              return hours + ':' + (minutes<10?'0':'')+minutes + ':' + (seconds<10?'0':'')+seconds + ' ' + ampm;
            }
          }

          function updateClocks() {
            var now = new Date();
            document.getElementById('dhaka-time').textContent  = formatTime(now, 'Asia/Dhaka');
            document.getElementById('london-time').textContent = formatTime(now, 'Europe/London');
            document.getElementById('sydney-time').textContent = formatTime(now, 'Australia/Sydney');

            var monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
            document.getElementById('english-date').textContent = monthNames[now.getMonth()] + ' ' + now.getDate() + ', ' + now.getFullYear();
            document.getElementById('bengali-date').textContent = getBengaliDate(now);
            document.getElementById('hijri-date').textContent   = getHijriDate(now);
          }

          updateClocks();
          setInterval(updateClocks, 1000);
        `}} />
      </body>
    </html>
  );
}
