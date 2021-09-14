const superagent = require('superagent').agent()

async function getContent() {
    var dashboard = await superagent
        .post('https://stdportal.tdtu.edu.vn/Login/SignIn?')
        .send({ user: process.env.user, pass: process.env.pass })
        .set('Content-Type', 'application/x-www-form-urlencoded');
    const url = dashboard.body.url.toString();
    const s = url.split('=');
    const newUrl = s[0] + '=https://lichhoc-lichthi.tdtu.edu.vn/tkb2.aspx&Token=' + s[2];
    const target = await superagent.get(newUrl);

    const start = target.text.indexOf('<tr class="rowContent">');
    const end = target.text.indexOf('<span id="ThoiKhoaBieu1_lblKhongCoDuLieuTKBTuan"');

    let html = target.text.slice(start, end - 25);
    html = html.replaceAll('class="', '');
    html = html.replaceAll('cell"', '');
    html = html.replaceAll('\r', '');
    html = html.replaceAll('\n', '');
    html = html.replaceAll('<font face="Tahoma">', '');
    html = html.replaceAll('</font>', '');
    html = html.replaceAll('\t', '');
    html = html.replaceAll('\"', '');
    // html = html.replaceAll('/', '');
    html = html.replaceAll('<', '');
    html = html.replaceAll('>', '');
    html = html.replaceAll('color=Whitetable');
    html = html.replaceAll('bgcolor=', '');
    html = html.replaceAll('width=100% cellpadding=0 cellspacing=0', '');
    html = html.replaceAll('class=\'lbl-lang\' style=\'color:white;padding-left:0px;\'|', '');
    html = html.replaceAll(' class=\'lbl-lang\' style=\'color:Black;padding-left:0px;\'', '');
    html = html.replaceAll('/label', '');
    html = html.replaceAll('trtdb', '');
    html = html.replaceAll('/bbr/', '');
    html = html.replaceAll('br', '');
    html = html.replaceAll('/td/tr/table', '');
    html = html.replaceAll('label', '');
    html = html.replaceAll(' - Nhóm', '');
    html = html.replaceAll('/Phòng', '');
    html = html.replaceAll(' undefined ', '');
    html = html.replaceAll(' color=Blacktable', '');
    html = html.replaceAll('/b style=\'color:DarkRed;', '');
    html = html.replaceAll(' rowspan=', '');
    html = html.replaceAll('/b', '');
    html = html.replaceAll('|', '');
    html = html.replaceAll('font face=Tahoma', '');
    html = JSON.stringify(html);

    var result = []

    const parentData = html.split('rowContent')
    var shift = 0;

    for (let parentElement of parentData) {

        if (parentElement.length > 70) {
            const childData = parentElement.split('/tdtd')
            var date = 1;

            for (let childElement of childData) {
                const length = childElement.length;
                if (length < 15 && length > 11) {
                    shift += 1;
                }
                if (length < 11 || length > 60) {
                    date += 1;

                    if (length > 60) {
                        result.push(date + ", " + shift + "," + childElement);
                    }
                }
                if (date == 1) {
                    continue;
                }
            }
        }
    }

    //toString
    result.sort();
    const str = result.join('?')
    return str
}

module.exports = getContent;