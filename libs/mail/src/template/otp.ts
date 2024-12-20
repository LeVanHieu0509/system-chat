export class OTPTemplate {
    html = `<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml"
    xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title></title>
    <style>
        table,
        td {
            color: #000000;
        }
        a {
            color: #0000ee;
            text-decoration: underline;
        }
        .u-row {
            display: flex;
            flex-wrap: nowrap;
            margin-left: 0;
            margin-right: 0;
        }
        .u-row .u-col {
            position: relative;
            width: 100%;
            padding-right: 0;
            padding-left: 0;
        }
        .u-row .u-col.u-col-100 {
            flex: 0 0 100%;
            max-width: 100%;
        }
        @media (max-width: 767px) {
            .u-row:not(.no-stack) {
                flex-wrap: wrap;
            }
            .u-row:not(.no-stack) .u-col {
                flex: 0 0 100%;
                max-width: 100%;
            }
        }
        body {
            margin: 0;
            padding: 0;
        }
        table,
        tr,
        td {
            vertical-align: top;
            border-collapse: collapse;
        }
        p {
            margin: 0;
        }
        .ie-container table,
        .mso-container table {
            table-layout: fixed;
        }
        * {
            line-height: inherit;
        }
    </style>
</head>
<body class="clean-body u_body" style="margin: 0;padding: 0;background-color: #f9f9f9;color: #000000">
    <table
        style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;vertical-align: top;min-width: 320px;Margin: 0 auto;background-color: #f9f9f9;width:100%"
        cellpadding="0" cellspacing="0">
        <tbody>
            <tr style="vertical-align: top">
                <td style="word-break: break-word;border-collapse: collapse;vertical-align: top">
                    <div style="padding: 0px;">
                        <div style="max-width: 600px;margin: 0 auto;background-color: #f0f0f0;">
                            <div class="u-row">
                                <div class="u-col u-col-100">
                                    <div
                                        style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                                        <table style="font-family:'Cabin',sans-serif;" role="presentation" width="100%"
                                            border="0">
                                            <tbody>
                                                <tr>
                                                    <td
                                                        style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Cabin',sans-serif;">
                                                        <table width="100%">
                                                            <tr>
                                                                <td style="padding-right: 0px;padding-left: 0px;">
                                                                    <img src="https://trustpay-uat.s3.ap-southeast-1.amazonaws.com/template/bg.png"
                                                                        style="width: 100%" />
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style="padding: 0px;">
                        <div style="max-width: 600px;margin: 0 auto;background-color: #ffffff;">
                            <div class="u-row">
                                <div class="u-col u-col-100">
                                    <div
                                        style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                                        <table style="font-family:'Cabin',sans-serif;" role="presentation"
                                            cellpadding="0" cellspacing="0" width="100%" border="0">
                                            <tbody>
                                                <tr>
                                                    <td style="overflow-wrap:break-word;word-break:break-word;padding:25px 55px 33px;font-family:'Cabin',sans-serif;"
                                                        align="left">
                                                        <div
                                                            style="line-height: 180%; text-align: left; word-wrap: break-word;">
                                                            <p dir="ltr" style="font-size: 18px; line-height: 25.2px;""><b>CHÀO MỪNG BẠN ĐẾN VỚI BITBACK</b>
                                                            </p><br />
                                                            <p style=" font-size: 16px; line-height: 180%;"><span
                                                                    style="font-size: 16px; line-height: 25.2px;">Cảm ơn
                                                                    bạn đã chọn Bitback, xác thực ngay email để có thể
                                                                    trải nghiệm tất cả các tính năng của ứng
                                                                    dụng.</span></p>
                                                            <p style=" font-size: 16px; line-height: 180%;"><span
                                                                    style="font-size: 16px; line-height: 25.2px;">Vui
                                                                    lòng nhập mã OTP dưới đây để hoàn tất xác thực.
                                                                </span></p>
                                                            <p style="font-size: 14px; line-height: 180%;">
                                                                <span
                                                                    style="color: #A80849; font-size: 20px; line-height: 46px;"><strong><span
                                                                            style="line-height: 46px; font-size: 20px;">{{code}}</span></strong></span>
                                                            </p>
                                                            <p style="font-size: 16px; line-height: 180%;">Mã này chỉ có
                                                                hiệu lực trong vòng <b>{{ttl}} phút</b>. Nếu đó không
                                                                phải
                                                                bạn, vui lòng bỏ qua email này.
                                                            </p>
                                                            <p style="font-size: 16px; line-height: 180%;">Trân trọng,
                                                                <br />
                                                                <b><i>Đội ngũ phát triển BitBack. </i></b>
                                                            </p>
                                                        </div>
                                                        <br />
                                                        <hr style="border-top: 2px solid #f579ce4f">
                                                        <br />
                                                        <div
                                                            style="line-height: 180%; text-align: left; word-wrap: break-word;">
                                                            <p dir="ltr" style="font-size: 18px; line-height: 25.2px;""><b>WELCOME TO BITBACK</b>
                                                            </p><br />
                                                            <p style=" font-size: 16px; line-height: 180%;"><span
                                                                    style="font-size: 16px; line-height: 25.2px;">Thanks
                                                                    for choosing us, let's verify your email and
                                                                    activate your account to start your new journey with
                                                                    Bitback.
                                                                </span></p>
                                                            <p style=" font-size: 16px; line-height: 180%;"><span
                                                                    style="font-size: 16px; line-height: 25.2px;">Please
                                                                    enter this code to access your Bitback account
                                                                </span></p>
                                                            <p style="font-size: 14px; line-height: 180%;">
                                                                <span
                                                                    style="color: #A80849; font-size: 20px; line-height: 46px;"><strong><span
                                                                            style="line-height: 46px; font-size: 20px;">{{code}}</span></strong></span>
                                                            </p>
                                                            <p style="font-size: 16px; line-height: 180%;">Please note
                                                                the verification code is only valid for <b>{{ttl}}
                                                                    minutes</b>. If you did not request this action,
                                                                please ignore this email.
                                                            </p>
                                                            <p style="font-size: 16px; line-height: 180%;">Thank you and
                                                                have fun playing,
                                                                <br />
                                                                <b><i>Bitback Team.
                                                                    </i></b>
                                                            </p>
                                                        </div>
                                                        <br />
                                                        <hr style="border-top: 2px solid #f579ce4f">
                                                        <div>
                                                            <ul
                                                                style="list-style: none; padding-left: 0; text-align: center;">
                                                                <li style="display: inline-block">
                                                                    <a href="https://www.facebook.com/bitbackcommunitytoken"
                                                                        target="_blank"><img
                                                                            style="width : 32px; height : 32px; margin-right: 10px;"
                                                                            src="https://trustpay-uat.s3.ap-southeast-1.amazonaws.com/template/ic-facebook.png"
                                                                            alt="icon facebook" /></a>
                                                                </li>
                                                                <li style="display: inline-block">
                                                                    <a href="https://twitter.com/BitbackBBC"
                                                                        target="_blank"><img
                                                                            style="width : 32px; height : 32px; margin-right: 10px;"
                                                                            src="https://trustpay-uat.s3.ap-southeast-1.amazonaws.com/template/ic-twitter.png"
                                                                            alt="icon skype" /></a>
                                                                </li>
                                                                <li style="display: inline-block">
                                                                    <a href="https://t.me/bitbackchannel"
                                                                        target="_blank"><img
                                                                            style="width : 32px; height : 32px; margin-right: 20px;"
                                                                            src="https://trustpay-uat.s3.ap-southeast-1.amazonaws.com/template/ic-telegram.png"
                                                                            alt="icon telegram" /></a>
                                                                </li>
                                                                <li style="display: inline-block; ">
                                                                    <a style="color: #A80849; vertical-align: super; margin-right: 20px; "
                                                                        target="_blank"
                                                                        href="https://bitback.community/">Bitback
                                                                        Community</a>
                                                                </li style="display: inline-block; ">
                                                                <a style="color: #A80849; vertical-align: super;"
                                                                    target="_blank"
                                                                    href="https://bitback.world/">Bitback World</a>
                                                            </ul>
                                                        </div>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </td>
            </tr>
        </tbody>
    </table>
</body>
</html>`;
}
