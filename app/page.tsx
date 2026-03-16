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
          var bengaliMonths = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
          var bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
          var hijriMonths = ['Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani', 'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', 'Shaban', 'Ramadan', 'Shawwal', 'Dhu al-Qidah', 'Dhu al-Hijjah'];

          function toBengaliNumber(num) {
            return String(num).split('').map(function(d) { return bengaliDigits[parseInt(d)]; }).join('');
          }

          function getHijriDate(gregDate) {
            var day = gregDate.getDate();
            var month = gregDate.getMonth();
            var year = gregDate.getFullYear();
            
            var jd = Math.floor((1461 * (year + 4800 + Math.floor((month - 14) / 12))) / 4) + 
                     Math.floor((367 * (month - 2 - 12 * (Math.floor((month - 14) / 12)))) / 12) - 
                     Math.floor((3 * (Math.floor((year + 4900 + Math.floor((month - 14) / 12)) / 100))) / 4) + 
                     day - 32075;
            
            var l = jd - 1948440 + 10632;
            var n = Math.floor((l - 1) / 10631);
            l = l - 10631 * n + 354;
            var j = (Math.floor((10985 - l) / 5316)) * (Math.floor((50 * l) / 17719)) + 
                    (Math.floor(l / 5670)) * (Math.floor((43 * l) / 15238));
            l = l - (Math.floor((30 - j) / 15)) * (Math.floor((17719 * j) / 50)) - 
                (Math.floor(j / 16)) * (Math.floor((15238 * j) / 43)) + 29;
            var hMonth = Math.floor((24 * l) / 709);
            var hDay = l - Math.floor((709 * hMonth) / 24);
            var hYear = 30 * n + j - 30;

            return {
              day: hDay,
              month: hMonth,
              year: hYear
            };
          }

          function formatTime(date, timeZone) {
            var options = {
              timeZone: timeZone,
              hour12: true,
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            };
            
            try {
              return date.toLocaleTimeString('en-US', options);
            } catch (e) {
              var utcTime = date.getTime() + (date.getTimezoneOffset() * 60000);
              var offsets = {
                'Asia/Dhaka': 6 * 60,
                'Europe/London': 0,
                'Australia/Sydney': 11 * 60
              };
              var offset = offsets[timeZone] || 0;
              var localDate = new Date(utcTime + (offset * 60000));
              var hours = localDate.getHours();
              var minutes = localDate.getMinutes();
              var seconds = localDate.getSeconds();
              var ampm = hours >= 12 ? 'PM' : 'AM';
              hours = hours % 12;
              hours = hours ? hours : 12;
              minutes = minutes < 10 ? '0' + minutes : minutes;
              seconds = seconds < 10 ? '0' + seconds : seconds;
              return hours + ':' + minutes + ':' + seconds + ' ' + ampm;
            }
          }

          function updateClocks() {
            var now = new Date();
            
            document.getElementById('dhaka-time').textContent = formatTime(now, 'Asia/Dhaka');
            document.getElementById('london-time').textContent = formatTime(now, 'Europe/London');
            document.getElementById('sydney-time').textContent = formatTime(now, 'Australia/Sydney');
            
            var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            var englishDate = monthNames[now.getMonth()] + ' ' + now.getDate() + ', ' + now.getFullYear();
            document.getElementById('english-date').textContent = englishDate;
            
            var bengaliDate = toBengaliNumber(now.getDate()) + ' ' + bengaliMonths[now.getMonth()] + ' ' + toBengaliNumber(now.getFullYear());
            document.getElementById('bengali-date').textContent = bengaliDate;
            
            var hijri = getHijriDate(now);
            var hijriDate = hijri.day + ' ' + hijriMonths[hijri.month - 1] + ' ' + hijri.year + ' AH';
            document.getElementById('hijri-date').textContent = hijriDate;
          }

          updateClocks();
          setInterval(updateClocks, 1000);
        `}} />
      </body>
    </html>
  );
}
