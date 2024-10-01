-- AlterTable
ALTER TABLE "currency_master" ADD COLUMN     "icon" TEXT DEFAULT E'';

UPDATE currency_master SET icon='https://trustpay-uat.s3.ap-southeast-1.amazonaws.com/cms/avatar/61de827d-e818f2-001b-35ceaa.png' WHERE code = 'SAT';

UPDATE currency_master SET icon='https://trustpay-uat.s3.ap-southeast-1.amazonaws.com/cms/avatar/61de82a3-e818f2-001b-1f2132.png' WHERE code = 'VNDC';

UPDATE currency_master SET icon='https://trustpay-uat.s3.ap-southeast-1.amazonaws.com/cms/avatar/61de82b9-e818f2-001b-2e1ed2.png' WHERE code = 'KAI';

UPDATE currency_master SET icon='https://trustpay-uat.s3.ap-southeast-1.amazonaws.com/cms/avatar/61de82dc-e818f2-001b-206633.png' WHERE code = 'BAMI';

UPDATE currency_master SET icon='https://trustpay-uat.s3.ap-southeast-1.amazonaws.com/cms/avatar/61de82fd-e818f2-001b-39bf3d.png' WHERE code = 'BBC';
