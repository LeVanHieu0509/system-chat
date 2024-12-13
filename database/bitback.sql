use bitback;

CREATE TABLE `follows` (
  `following_user_id` integer,
  `followed_user_id` integer,
  `created_at` timestamp
);

CREATE TABLE `users` (
  `id` integer PRIMARY KEY,
  `username` varchar(255),
  `role` varchar(255),
  `created_at` timestamp
);

CREATE TABLE `posts` (
  `id` integer PRIMARY KEY,
  `title` varchar(255),
  `body` text COMMENT 'Content of the post',
  `user_id` integer,
  `status` varchar(255),
  `created_at` timestamp
);

CREATE TABLE `_prisma_migrations` (
  `id` VARCHAR(36) PRIMARY KEY NOT NULL,
  `checksum` VARCHAR(64) NOT NULL,
  `finished_at` timestamp,
  `migration_name` VARCHAR(255) NOT NULL,
  `logs` text,
  `rolled_back_at` timestamp,
  `started_at` timestamp NOT NULL DEFAULT (now()),
  `applied_steps_count` integer NOT NULL DEFAULT 0
);

-- Lưu trữ thông tin về người dùng hoặc tài khoản
CREATE TABLE `account` (
  `id` VARCHAR(36) PRIMARY KEY NOT NULL DEFAULT (UUID()), -- Khóa chính, là UUID của tài khoản
  `avatar` VARCHAR(350),
  `full_name` VARCHAR(255),
  `email` VARCHAR(50),
  `passcode` VARCHAR(100),
  `email_verified` TINYINT(1) DEFAULT 0, -- Xác định xem email đã được xác minh chưa (0: chưa xác minh, 1: đã xác minh).
  `phone` VARCHAR(20),
  `status` integer NOT NULL DEFAULT 1, -- Trạng thái của tài khoản (1: đang hoạt động, 0: không hoạt động).
  `kyc_status` integer NOT NULL DEFAULT 0, -- Trạng thái xác minh danh tính của tài khoản (ví dụ: KYC - Know Your Customer).
  `created_at` timestamp(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` timestamp(3),
  `referral_code` VARCHAR(8), -- Mã giới thiệu của người dùng
  `device_token` VARCHAR(255), -- Mã thiết bị, có thể được sử dụng cho thông báo đẩy (push notification).
  `facebook_id` VARCHAR(50), -- Thông tin liên kết tài khoản
  `google_id` VARCHAR(50),
  `apple_id` VARCHAR(50),
  `is_partner` TINYINT(1) NOT NULL DEFAULT 0,
  `phone_verified` TINYINT(1) DEFAULT 0,
  `referral_link` VARCHAR(255), -- Liên kết giới thiệu của người dùng
  `histories` TEXT, -- Lịch sử hoạt động của tài khoản.
  `secret_key` VARCHAR(255), -- Khóa bí mật liên quan đến bảo mật.
  `type` VARCHAR(255) NOT NULL DEFAULT ('USER'), -- Loại tài khoản.
  `kyc_approval_at` timestamp(3), -- Thời điểm tài khoản được xác minh danh tính
  `gift_address` text, -- Địa chỉ để gửi quà.
  `wallet_address` VARCHAR(255) -- Địa chỉ ví tiền của người dùng.
);

CREATE TABLE `account_contact` (
  `contact_id` VARCHAR(36) NOT NULL DEFAULT (UUID()),
  `display_name` VARCHAR(255),
  `created_at` timestamp(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` timestamp(3),
  `deleted_at` timestamp(3),
  `account_id` VARCHAR(36) NOT NULL,
  PRIMARY KEY (`account_id`, `contact_id`)
);

-- Bảng account_daily_lucky_wheel dùng để lưu trữ thông tin về vòng quay may mắn hàng ngày của người dùng
CREATE TABLE `account_daily_lucky_wheel` (
  `id` VARCHAR(36) PRIMARY KEY NOT NULL DEFAULT (UUID()),
  `status` smallint NOT NULL DEFAULT 1, -- Trạng thái của vòng quay (ví dụ: 1 có thể là hoạt động, 0 là không hoạt động).
  `note` VARCHAR(100), -- Ghi chú cho vòng quay này.
  `created_at` timestamp(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` timestamp(3),
  `account_id` VARCHAR(36) NOT NULL, -- Mã định danh của tài khoản người dùng liên quan đến vòng quay này.
  `reward_status` smallint NOT NULL DEFAULT 1, -- Trạng thái nhận thưởng (ví dụ: 1 là đã nhận, 0 là chưa nhận).
  `transaction_id` VARCHAR(36), -- Mã định danh của giao dịch liên quan đến phần thưởng từ vòng quay.
  `reward` integer NOT NULL DEFAULT 0, -- Giá trị phần thưởng nhận được từ vòng quay.
  `reward_at` timestamp(3), -- Thời điểm phần thưởng được nhận.
  `reward_title` VARCHAR(150), -- Tiêu đề mô tả phần thưởng
  `type` smallint, -- Loại vòng quay hoặc phần thưởng.
  `is_approved` TINYINT(1) DEFAULT 1, -- Xác nhận việc nhận thưởng (1 là đã phê duyệt, 0 là chưa phê duyệt).
  `luckyWheelHistories` TEXT -- Lịch sử các hoạt động liên quan đến vòng quay này, lưu dưới dạng văn bản.
);

CREATE TABLE `account_daily_lucky_wheel_history` (
  `id` VARCHAR(36) PRIMARY KEY NOT NULL DEFAULT (UUID()),
  `note` VARCHAR(255) NOT NULL,
  `created_at` timestamp(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `daily_reward_id` VARCHAR(36) NOT NULL
);

-- Xác định địa chỉ ví cụ thể cho mỗi loại tiền tệ của từng tài khoản
CREATE TABLE `account_exchange_currency` (
  `account_id` VARCHAR(36) NOT NULL, -- Chuỗi 36 ký tự, lưu ID tài khoản, không được để trống.
  `currency_id` VARCHAR(36) NOT NULL, -- Chuỗi 36 ký tự, lưu ID loại tiền tệ, không được để trống.
  `wallet_address` text NOT NULL, -- Kiểu text, lưu địa chỉ ví của tài khoản, không được để trống.
  `created_at` timestamp(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` timestamp(3),
  PRIMARY KEY (`account_id`, `currency_id`)
);

CREATE TABLE `account_history` (
  `id` VARCHAR(36) PRIMARY KEY NOT NULL DEFAULT (UUID()),
  `reason` VARCHAR(255),
  `created_at` timestamp(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `account_id` VARCHAR(36) NOT NULL,
  `created_by` VARCHAR(36) NOT NULL,
  `json` TEXT
);

CREATE TABLE `account_kyc_ipn` (
  `account_id` VARCHAR(36) PRIMARY KEY NOT NULL,
  `type` text,
  `state` text,
  `connected_state` text,
  `full_name` text,
  `phone` text,
  `gender` text,
  `histories` TEXT,
  `created_at` timestamp(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` timestamp(3)
);

CREATE TABLE `account_partner_commission` (
  `id` VARCHAR(36) PRIMARY KEY NOT NULL DEFAULT (UUID()),
  `commission` integer NOT NULL DEFAULT 0,
  `total_value` integer NOT NULL DEFAULT 0,
  `account_id` VARCHAR(36) NOT NULL,
  `transaction_id` VARCHAR(36) NOT NULL,
  `is_approved` TINYINT(1) NOT NULL DEFAULT 0,
  `paid` integer NOT NULL DEFAULT 0
);

-- quản lý việc giới thiệu của người dùng
CREATE TABLE `account_referral` (
  `referral_from` VARCHAR(36) NOT NULL, -- ID của tài khoản được người khác giới thiệu (người nhận giới thiệu).
  `referral_by` VARCHAR(36) NOT NULL, -- ID của tài khoản giới thiệu người khác (người giới thiệu).
  `created_at` timestamp(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  PRIMARY KEY (`referral_from`, `referral_by`) -- Khóa chính kết hợp giữa referral_from và referral_by để đảm bảo mỗi mối quan hệ giới thiệu là duy nhất.
);

-- thống kê việc giới thiệu của người dùng
CREATE TABLE `account_referral_stats` (
  `account_id` VARCHAR(36) PRIMARY KEY NOT NULL, -- ID của tài khoản (khóa chính).
  `total_referrals` integer NOT NULL DEFAULT 0, -- Tổng số lần người dùng đã giới thiệu người khác.
  `total_kyc` integer NOT NULL DEFAULT 0, -- Tổng số người dùng được giới thiệu đã xác minh danh tính (KYC).
  `created_at` timestamp(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` timestamp(3)
);

CREATE TABLE `account_reward_event` (
  `id` VARCHAR(36) PRIMARY KEY NOT NULL DEFAULT (UUID()),
  `status` smallint NOT NULL DEFAULT 1,
  `time_start` bigint NOT NULL DEFAULT 0,
  `time_end` bigint NOT NULL DEFAULT 0,
  `created_at` timestamp(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` timestamp(3),
  `account_id` VARCHAR(36),
  `event_id` VARCHAR(36)
);

CREATE TABLE `account_setting` (
  `id` VARCHAR(36) PRIMARY KEY NOT NULL DEFAULT (UUID()),
  `created_at` timestamp(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `receive_notify` TINYINT(1) NOT NULL DEFAULT 1,
  `account_id` VARCHAR(36) NOT NULL,
  `language` ENUM('VI', 'EN') NOT NULL DEFAULT 'VI'
);

-- Bảng này được dùng để lưu trữ tóm tắt về các hoạt động của tài khoản trong một khoảng thời gian nhất định (ngày, tuần, tháng, năm)
-- Đếm số lần đăng nhập của người dùng trong mỗi ngày
-- Ghi nhận số phần thưởng mà người dùng nhận được trong mỗi tuần hoặc tháng

/*
--> Lưu lại số lần đăng nhập cũng như là số lần nhận thưởng khi mà tạo account.
--> bảng Summary này để theo dõi hành vi người dùng, đưa ra được báo cáo thống kê lượng lớn dữ liệu người dùng
--> Có được dữ liệu về tần suất hoạt động giúp quản trị viên có được cái nhìn tổng quan.
--> Nếu 1 chiến dịch quảng cáo -> khiến cho lượng user tạo tài khoản nhiều trong 1 khoảng thời gian chạy chiến dịch -> chiến dịch đó thành công.
--> Check xem người dùng nào ít hoạt động --> triển khai chiến lược cho người dùng quay lại
--> Chỉ số này giúp đưa ra được số liệu thực tế và giúp cho đội ngũ quản lý đưa chiến lược phù hợp.
*/
CREATE TABLE `account_summary` (
  `value` integer NOT NULL DEFAULT 0, -- số lượng sự kiện hoặc giá trị tổng liên quan đến tài khoản trong một khoảng thời gian nhất định
  `day` smallint NOT NULL,
  `week` smallint NOT NULL,
  `month` smallint NOT NULL,
  `year` integer NOT NULL,
  `created_at` timestamp(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` timestamp(3)
);

CREATE TABLE `banner` (
  `id` VARCHAR(36) PRIMARY KEY NOT NULL DEFAULT (UUID()),
  `url_content` VARCHAR(255) NOT NULL,
  `position` smallint NOT NULL DEFAULT 1,
  `created_at` timestamp(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` timestamp(3),
  `link` text
);

CREATE TABLE `bonus_event` (
  `id` VARCHAR(36) PRIMARY KEY NOT NULL DEFAULT (UUID()),
  `name` VARCHAR(255) NOT NULL,
  `status` VARCHAR(15) NOT NULL DEFAULT ('NEW'),
  `time_start` bigint NOT NULL DEFAULT 0,
  `time_end` bigint NOT NULL DEFAULT 0,
  `link` text,
  `prize_pool` numeric(65,30) NOT NULL DEFAULT 0,
  `created_at` timestamp(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` timestamp(3),
  `currency_id` VARCHAR(36) NOT NULL,
  `broker_id` VARCHAR(36) NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
  `created_id` VARCHAR(36) NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
  `updated_id` VARCHAR(36)
);

CREATE TABLE `bonus_event_account` (
  `amount` numeric(65,30) NOT NULL DEFAULT 0,
  `note` text NOT NULL,
  `created_at` timestamp(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` timestamp(3),
  `account_id` VARCHAR(36) NOT NULL,
  `bonus_event_id` VARCHAR(36) NOT NULL,
  `cashback_transaction_id` VARCHAR(36),
  `ranking` integer NOT NULL,
  PRIMARY KEY (`account_id`, `bonus_event_id`)
);

CREATE TABLE `campaign` (
  `id` VARCHAR(36) PRIMARY KEY NOT NULL DEFAULT (UUID()),
  `title` VARCHAR(255) NOT NULL,
  `open_link` VARCHAR(255),
  `banner` VARCHAR(255),
  `logo` VARCHAR(255),
  `slogan` VARCHAR(255),
  `description` VARCHAR(500),
  `count_trans` integer DEFAULT 0,
  `contact_email` VARCHAR(50),
  `contact_phone` VARCHAR(20),
  `created_at` timestamp(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` timestamp(3),
  `deleted_at` timestamp(3),
  `total_commission` integer DEFAULT 0,
  `position` smallint DEFAULT 0,
  `category_id` VARCHAR(36)
);

CREATE TABLE `campaign_category` (
  `id` VARCHAR(36) PRIMARY KEY NOT NULL DEFAULT (UUID()),
  `name` VARCHAR(255),
  `cashback_rate` double precision DEFAULT 0,
  `category_id` VARCHAR(50),
  `from_source` VARCHAR(300),
  `created_at` timestamp(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` timestamp(3),
  `deleted_at` timestamp(3),
  `campaign_id` VARCHAR(36) NOT NULL
);

/*
1. cashback_available là số tiền cashback khả dụng hiện tại của tài khoản. 
2. Mọi thay đổi của nó đều được ghi lại trong bảng cashback_available_histories.
3. Khi người dùng hoặc hệ thống thực hiện giao dịch hoàn tiền, các giao dịch này sẽ được lưu lại trong bảng cashback_transaction hoặc cashback_transaction_broker.
4. cashback_summary giúp tổng kết thông tin về các khoản cashback đã diễn ra trong ngày, tuần, tháng và năm để phục vụ việc báo cáo và phân tích.
*/

-- Bảng quản lý số dư hiện có của mỗi tài khoản và chi tiết về trạng thái, loại tiền tệ cũng như lý do của mỗi khoản.
CREATE TABLE `cashback_available` (
  `id` VARCHAR(36) PRIMARY KEY NOT NULL DEFAULT (UUID()),
  `amount` numeric(65,30) NOT NULL DEFAULT 0, -- Số tiền khả dụng
  `reason` VARCHAR(255), --  Lý do liên quan đến cashback, mô tả chi tiết về lý do có số tiền này
  `created_at` timestamp(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` timestamp(3),
  `currency_id` VARCHAR(36) NOT NULL, -- Tham chiếu đến ID của loại tiền tệ
  `account_id` VARCHAR(36) NOT NULL, -- Tham chiếu đến ID của tài khoản 
  `status` smallint NOT NULL DEFAULT 1, -- Trạng thái của cashback (1: hoạt động, 0: không hoạt động).
  `version` integer NOT NULL DEFAULT 1 -- Phiên bản của bản ghi, dùng để kiểm soát phiên bản và cập nhật dữ liệu
);


-- Bảng này lưu lịch sử thay đổi của cashback_available. Mỗi khi số dư cashback thay đổi, lịch sử của nó sẽ được lưu vào bảng này
CREATE TABLE `cashback_available_histories` (
  `id` VARCHAR(36) PRIMARY KEY NOT NULL DEFAULT (UUID()),
  `old_balance` numeric(65,30) NOT NULL DEFAULT 0, -- Đây là số dư trước khi có sự thay đổi. Giá trị này giúp biết số dư của người dùng trước khi giao dịch xảy ra.
  `amount` numeric(65,30) NOT NULL DEFAULT 0, -- Đây là số tiền thay đổi của số dư, Điều này cho phép hệ thống biết cụ thể số tiền đã thay đổi trong giao dịch.
  `type` VARCHAR(1), -- Loại thay đổi của giao dịch, ví dụ: tăng hoặc giảm số dư. Giá trị này có thể là một mã để chỉ định loại giao dịch cụ thể 
  `last_update` timestamp(3), -- Thời gian thay đổi cuối cùng, giúp theo dõi khi nào số dư đã được cập nhật lần gần nhất.
  `created_at` timestamp(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` timestamp(3),
  `ca_id` VARCHAR(36) NOT NULL -- Đây là khóa ngoại, liên kết với bảng cashback_available. Mục đích là để ghi nhận thay đổi này thuộc về số dư cashback của tài khoản nào.
);

/*
  Bảng cashback_summary được sử dụng để lưu trữ thông tin tổng quan về các giao dịch,
  theo ngày, tuần, tháng và năm, giúp theo dõi chi tiết tổng số tiền hoàn lại trong từng khoảng thời gian
*/

CREATE TABLE `cashback_summary` (
  `value` integer NOT NULL DEFAULT 0, -- Số lượng giao dịch hoàn tiền trong một thời điểm nhất định (ngày, tuần, tháng, năm)
  `amount` numeric(65,30) NOT NULL DEFAULT 0, -- Tổng số tiền đã hoàn trả trong một thời điểm nhất định
  `status` integer NOT NULL, -- Trạng thái của bản ghi hoàn tiền (có thể là đã xử lý, đang chờ xử lý, v.v.)
  `day` smallint NOT NULL, -- Xác định thời điểm của bản ghi (theo ngày, tuần, tháng và năm) để dễ dàng phân loại.
  `week` smallint NOT NULL,
  `month` smallint NOT NULL,
  `year` integer NOT NULL,
  `created_at` timestamp(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` timestamp(3),
  `type` integer NOT NULL DEFAULT 0 -- Kiểu hoàn tiền, dùng để phân biệt các loại hoàn tiền khác nhau
);

/*
  1. Được sử dụng để lưu trữ thông tin chi tiết về từng giao dịch hoàn tiền
  2. Đây là cách để theo dõi các hoạt động liên quan đến hoàn tiền giữa các tài khoản, 
  3. đồng thời lưu giữ thông tin về các chương trình hoặc chiến dịch cụ thể
  4. Ghi nhận mọi thông tin liên quan như người gửi, người nhận, loại hoàn tiền, thời gian và trạng thái của giao dịch
*/

CREATE TABLE `cashback_transaction` (
  `id` VARCHAR(36) PRIMARY KEY NOT NULL DEFAULT (UUID()),
  `type` integer NOT NULL DEFAULT 1, -- Loại giao dịch
  `amount` numeric(65,30) NOT NULL DEFAULT 0, --  Số tiền được giao dịch
  `fee` integer DEFAULT 0, --  Phí giao dịch
  `status` smallint NOT NULL DEFAULT 1, -- Trạng thái của giao dịch
  `description` VARCHAR(255), -- Mô tả chi tiết về giao dịch, ví dụ "Hoàn tiền từ giới thiệu bạn bè."
  `created_at` timestamp(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` timestamp(3),
  `vndc_json` TEXT, -- Thông tin chi tiết về giao dịch liên quan đến VNDC 
  `access_trade_id` VARCHAR(50), -- ID của giao dịch liên quan đến AccessTrade
  `access_trade_json` TEXT, -- Chi tiết về giao dịch AccessTrade (nếu có).
  `currency_id` VARCHAR(36) NOT NULL, -- ID của loại tiền tệ được sử dụng trong giao dịch
  `campaign_id` VARCHAR(36), -- ID của chiến dịch liên quan đến giao dịch
  `sender_id` VARCHAR(36), -- ID của người gửi và người nhận trong giao dịch
  `receiver_id` VARCHAR(36),
  `title` VARCHAR(150), -- Tiêu đề của giao dịch
  `cbHistories` TEXT, -- Lịch sử của giao dịch, có thể lưu các thay đổi trạng thái, mô tả chi tiết dưới dạng văn bản hoặc JSON.
  `old_balance` numeric(65,30) NOT NULL DEFAULT 0, -- Số dư cũ của người nhận trước khi có giao dịch này
  `action_type` integer NOT NULL -- Loại hành động của giao dịch
);

CREATE TABLE `cashback_transaction_broker` (
  `id` VARCHAR(36) PRIMARY KEY NOT NULL DEFAULT (UUID()),
  `type` integer NOT NULL DEFAULT 0,
  `amount` numeric(65,30) NOT NULL DEFAULT 0,
  `fee` integer DEFAULT 0,
  `status` smallint NOT NULL DEFAULT 1,
  `action_type` integer NOT NULL,
  `title` VARCHAR(150),
  `description` VARCHAR(255),
  `created_at` timestamp(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` timestamp(3),
  `old_balance` numeric(65,30) NOT NULL DEFAULT 0,
  `currency_id` VARCHAR(36) NOT NULL,
  `sender_id` VARCHAR(36),
  `receiver_id` VARCHAR(36),
  `histories` TEXT,
  `transaction_number` text,
  `vndc_user_id` text
);

CREATE TABLE `category_master` (
  `id` VARCHAR(36) PRIMARY KEY NOT NULL DEFAULT (UUID()),
  `icon` VARCHAR(150),
  `name` VARCHAR(100),
  `description` VARCHAR(255),
  `created_at` timestamp(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` timestamp(3),
  `deleted_at` timestamp(3)
);

CREATE TABLE `chicken_farm_adult` (
  `id` VARCHAR(36) PRIMARY KEY NOT NULL DEFAULT (UUID()),
  `type` smallint NOT NULL DEFAULT 1,
  `level` smallint NOT NULL DEFAULT 1,
  `status` smallint NOT NULL DEFAULT 1,
  `time_start` bigint NOT NULL DEFAULT 0,
  `time_end` bigint NOT NULL DEFAULT 0,
  `last_harvest` bigint NOT NULL DEFAULT 0,
  `created_at` timestamp(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` timestamp(3),
  `egg_claimed_level_1` integer NOT NULL DEFAULT 0,
  `egg_claimed_level_2` integer NOT NULL DEFAULT 0,
  `egg_claimed_level_3` integer NOT NULL DEFAULT 0,
  `egg_claimed_level_4` integer NOT NULL DEFAULT 0,
  `egg_claimed_level_5` integer NOT NULL DEFAULT 0,
  `egg_id` VARCHAR(36) NOT NULL,
  `owner_id` VARCHAR(36),
  `total_egg_sold` integer NOT NULL DEFAULT 0,
  `chicken_no` integer NOT NULL,
  `histories` TEXT
);

CREATE TABLE `chicken_farm_breed` (
  `id` VARCHAR(36) PRIMARY KEY NOT NULL DEFAULT (UUID()),
  `finished_time` bigint NOT NULL,
  `created_at` timestamp(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` timestamp(3),
  `hen_id` VARCHAR(36) NOT NULL,
  `rooster_id` VARCHAR(36) NOT NULL,
  `is_completed` TINYINT(1) NOT NULL DEFAULT 0
);

CREATE TABLE `chicken_farm_egg` (
  `id` VARCHAR(36) PRIMARY KEY NOT NULL DEFAULT (UUID()),
  `status` smallint NOT NULL DEFAULT 1,
  `time_start` bigint NOT NULL DEFAULT 0,
  `time_end` bigint NOT NULL DEFAULT 0,
  `created_at` timestamp(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` timestamp(3),
  `owner_id` VARCHAR(36) NOT NULL,
  `egg_event_id` VARCHAR(36),
  `histories` TEXT,
  `breed_id` VARCHAR(36),
  `type` smallint NOT NULL DEFAULT 1
);

CREATE TABLE `chicken_farm_egg_event` (
  `id` VARCHAR(36) PRIMARY KEY NOT NULL DEFAULT (UUID()),
  `title` VARCHAR(255) NOT NULL,
  `price` integer NOT NULL DEFAULT 0,
  `status` smallint NOT NULL DEFAULT 1,
  `total_egg` integer NOT NULL DEFAULT 0,
  `total_sold` integer NOT NULL DEFAULT 0,
  `number_order` integer NOT NULL DEFAULT 0,
  `limit_per_buy` integer NOT NULL DEFAULT 1,
  `created_at` timestamp(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` timestamp(3),
  `created_id` VARCHAR(36),
  `currency_id` VARCHAR(36),
  `time_start` bigint NOT NULL DEFAULT 0,
  `time_end` bigint NOT NULL DEFAULT 0,
  `history` TEXT,
  `type` smallint NOT NULL DEFAULT 1
);

CREATE TABLE `chicken_farm_egg_harvest` (
  `level` smallint NOT NULL DEFAULT 1,
  `total` integer NOT NULL DEFAULT 0,
  `time_last_harvest` bigint NOT NULL DEFAULT 0,
  `created_at` timestamp(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` timestamp(3),
  `date` VARCHAR(10) NOT NULL,
  `chicken_id` VARCHAR(36) NOT NULL,
  `owner_id` VARCHAR(36) NOT NULL,
  PRIMARY KEY (`date`, `chicken_id`, `owner_id`, `level`)
);

CREATE TABLE `chicken_farm_event` (
  `id` VARCHAR(36) PRIMARY KEY NOT NULL DEFAULT (UUID()),
  `title` text,
  `banner` text NOT NULL,
  `status` smallint NOT NULL DEFAULT 0,
  `link` text,
  `created_at` timestamp(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` timestamp(3),
  `deleted_at` timestamp(3),
  `button_title` text
);

CREATE TABLE `chicken_farm_extra_slot` (
  `id` VARCHAR(36) PRIMARY KEY NOT NULL DEFAULT (UUID()),
  `quantity` smallint NOT NULL DEFAULT 1,
  `amount` numeric(65,30) NOT NULL DEFAULT 0,
  `created_at` timestamp(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` timestamp(3),
  `owner_id` VARCHAR(36) NOT NULL
);

CREATE TABLE `chicken_farm_market` (
  `id` VARCHAR(36) PRIMARY KEY NOT NULL DEFAULT (UUID()),
  `price` integer NOT NULL DEFAULT 0,
  `status` integer NOT NULL DEFAULT 1,
  `created_at` timestamp(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` timestamp(3),
  `egg_id` VARCHAR(36),
  `chicken_id` VARCHAR(36),
  `buyer_id` VARCHAR(36),
  `seller_id` VARCHAR(36) NOT NULL,
  `currency_id` VARCHAR(36),
  `finished_at` timestamp(3),
  `fee_percent` double precision NOT NULL DEFAULT 0,
  `fee_total` integer NOT NULL DEFAULT 0,
  `fee_type` smallint NOT NULL DEFAULT 1,
  `rooster_id` VARCHAR(36)
);

CREATE TABLE `chicken_farm_rooster` (
  `id` VARCHAR(36) PRIMARY KEY NOT NULL DEFAULT (UUID()),
  `chicken_no` integer NOT NULL,
  `type` smallint NOT NULL DEFAULT 1,
  `status` smallint NOT NULL DEFAULT 1,
  `time_start` bigint NOT NULL DEFAULT 0,
  `time_end` bigint NOT NULL DEFAULT 0,
  `last_bred` bigint NOT NULL DEFAULT 0,
  `created_at` timestamp(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` timestamp(3),
  `histories` TEXT,
  `egg_id` VARCHAR(36) NOT NULL,
  `owner_id` VARCHAR(36)
);

CREATE TABLE `chicken_farm_transaction` (
  `id` VARCHAR(36) PRIMARY KEY NOT NULL DEFAULT (UUID()),
  `amount` numeric(65,30) NOT NULL DEFAULT 0,
  `quantity` integer NOT NULL DEFAULT 1,
  `status` smallint NOT NULL DEFAULT 1,
  `type` smallint NOT NULL DEFAULT 1,
  `created_at` timestamp(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` timestamp(3),
  `market_id` VARCHAR(36),
  `currency_id` VARCHAR(36),
  `buyer_id` VARCHAR(36),
  `seller_id` VARCHAR(36),
  `buyer_description` VARCHAR(255),
  `seller_description` VARCHAR(255),
  `histories` TEXT,
  `finished_at` timestamp(3)
);

CREATE TABLE `config` (
  `id` VARCHAR(36) PRIMARY KEY NOT NULL DEFAULT (UUID()),
  `type` smallint NOT NULL,
  `value` double precision NOT NULL DEFAULT 0,
  `unit` smallint NOT NULL DEFAULT 0,
  `created_at` timestamp(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` timestamp(3),
  `display_name` VARCHAR(255),
  `user_id` VARCHAR(36) NOT NULL
);

CREATE TABLE `config_ads` (
  `id` VARCHAR(36) PRIMARY KEY NOT NULL DEFAULT (UUID()),
  `title` VARCHAR(150),
  `url` VARCHAR(300) NOT NULL,
  `start_at` timestamp(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `stop_at` timestamp(3),
  `created_at` timestamp(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` timestamp(3),
  `created_id` VARCHAR(36),
  `external_link` VARCHAR(255),
  `button_title` VARCHAR(50),
  `status` smallint NOT NULL DEFAULT 0
);

/*
  1. Sử dụng để lưu trữ cấu hình hoa hồng cho các chương trình giới thiệu hoặc thưởng khác
  2. Bảng này giúp quản lý các thông tin về mức hoa hồng và điều kiện để nhận hoa hồng trong các tình huống khác nhau.
*/
CREATE TABLE `config_commission` (
  `id` VARCHAR(36) PRIMARY KEY NOT NULL DEFAULT (UUID()),
  `created_at` timestamp(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` timestamp(3),
  `referral_by` integer NOT NULL DEFAULT 0, -- Hoa hồng dành cho người giới thiệu - 100 SAT
  `referral_from` integer NOT NULL DEFAULT 0, -- Hoa hồng dành cho người được giới thiệu -- 1500 SAT
  `non_referral` integer NOT NULL DEFAULT 0, -- Mức thưởng cho người không có giới thiệu -- 0 SAT
  `need_kyc` TINYINT(1) NOT NULL DEFAULT 1 -- Điều kiện xác minh danh tính (KYC). Nếu giá trị là 1, nghĩa là người dùng cần phải hoàn thành xác minh danh tính (KYC) để nhận được hoa hồng.
);

CREATE TABLE `config_daily_lucky_wheel` (
  `id` VARCHAR(36) PRIMARY KEY NOT NULL DEFAULT (UUID()),
  `title` VARCHAR(150) NOT NULL,
  `rate` double precision NOT NULL DEFAULT 0,
  `type` smallint NOT NULL DEFAULT 1,
  `reward` integer NOT NULL DEFAULT 0,
  `approval` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` timestamp(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` timestamp(3),
  `updated_id` VARCHAR(36),
  `currency_id` VARCHAR(36)
);

CREATE TABLE `config_event` (
  `id` VARCHAR(36) PRIMARY KEY NOT NULL DEFAULT (UUID()),
  `title` VARCHAR(150) NOT NULL,
  `reward` integer NOT NULL DEFAULT 0,
  `time` integer NOT NULL DEFAULT 0,
  `total_amount` numeric(65,30) NOT NULL DEFAULT 0,
  `total_paid` numeric(65,30) NOT NULL DEFAULT 0,
  `status` VARCHAR(10) NOT NULL DEFAULT ('NEW'),
  `created_at` timestamp(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` timestamp(3),
  `created_id` VARCHAR(36),
  `currency_id` VARCHAR(36)
);

CREATE TABLE `config_interest_rate` (
  `id` VARCHAR(36) PRIMARY KEY NOT NULL DEFAULT (UUID()),
  `title` VARCHAR(150) NOT NULL,
  `description` VARCHAR(500) NOT NULL,
  `rate` double precision NOT NULL DEFAULT 0,
  `created_at` timestamp(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` timestamp(3),
  `from_wallet_id` VARCHAR(36) NOT NULL,
  `wallet_receive_id` VARCHAR(36) NOT NULL,
  `updated_id` VARCHAR(36)
);

CREATE TABLE `config_interest_rate_history` (
  `id` VARCHAR(36) PRIMARY KEY NOT NULL DEFAULT (UUID()),
  `changed_config` TEXT NOT NULL,
  `config_interest_rate_id` VARCHAR(36) NOT NULL,
  `updated_by_id` VARCHAR(36) NOT NULL,
  `created_at` timestamp(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` timestamp(3)
);

CREATE TABLE `config_payment_lucky_wheel` (
  `id` VARCHAR(36) PRIMARY KEY NOT NULL DEFAULT (UUID()),
  `title` VARCHAR(150) NOT NULL,
  `rate` double precision NOT NULL DEFAULT 0,
  `type` smallint NOT NULL DEFAULT 1,
  `reward` integer NOT NULL DEFAULT 0,
  `approval` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` timestamp(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` timestamp(3),
  `updated_id` VARCHAR(36),
  `currency_id` VARCHAR(36)
);

CREATE TABLE `currency_limit_setting` (
  `id` VARCHAR(36) PRIMARY KEY NOT NULL DEFAULT (UUID()),
  `type` smallint NOT NULL,
  `fee` double precision NOT NULL DEFAULT 0,
  `min` double precision NOT NULL,
  `max` double precision NOT NULL,
  `min_hold` double precision,
  `max_per_day` double precision,
  `max_per_month` double precision,
  `currency_id` VARCHAR(36) NOT NULL,
  `created_at` timestamp(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` timestamp(3)
);

-- lưu trữ thông tin về các loại tiền tệ trong hệ thống
CREATE TABLE `currency_master` (
  `id` VARCHAR(36) PRIMARY KEY NOT NULL DEFAULT (UUID()),
  `code` VARCHAR(10) NOT NULL, -- Mã tiền tệ, ví dụ "USD".
  `name` VARCHAR(50) NOT NULL, -- Tên của loại tiền tệ
  `status` smallint NOT NULL DEFAULT 1, -- Trạng thái hoạt động của tiền tệ (1: hoạt động, 0: không hoạt động).
  `created_at` timestamp(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` timestamp(3),
  `exchange_wallet_editable` TINYINT(1) NOT NULL DEFAULT 0, -- Cho phép chỉnh sửa trong ví trao đổi (0: không, 1: có).
  `is_calculate_decimals` TINYINT(1) NOT NULL DEFAULT 0, -- Cho phép tính toán với số thập phân (0: không, 1: có).
  `exchangeable` TINYINT(1) NOT NULL DEFAULT 0, -- Tiền tệ này có thể trao đổi hay không (0: không, 1: có).
  `fixed_decimal` VARCHAR(10), -- Độ chính xác số thập phân cố định cho tiền tệ (nếu có).
  `visible` TINYINT(1) NOT NULL DEFAULT 1, -- Hiển thị tiền tệ này cho người dùng (0: không, 1: có).
  `withdrawable` TINYINT(1) NOT NULL DEFAULT 0, -- Tiền tệ này có thể rút ra được hay không (0: không, 1: có).
  `icon` TEXT -- Đường dẫn đến biểu tượng của loại tiền tệ.
);              

CREATE TABLE `event` (
  `id` VARCHAR(36) PRIMARY KEY NOT NULL DEFAULT (UUID()),
  `name` VARCHAR(255) NOT NULL,
  `status` smallint NOT NULL DEFAULT 1,
  `time_start` bigint NOT NULL DEFAULT 0,
  `time_end` bigint NOT NULL DEFAULT 0,
  `information` text,
  `history` TEXT,
  `created_at` timestamp(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` timestamp(3),
  `created_id` VARCHAR(36) NOT NULL,
  `updated_id` VARCHAR(36),
  `type` smallint NOT NULL DEFAULT 1
);

CREATE TABLE `golden_egg_exchange_setting` (
  `id` VARCHAR(36) PRIMARY KEY NOT NULL DEFAULT (UUID()),
  `min_number_of_eggs` double precision NOT NULL,
  `price` double precision NOT NULL,
  `exchangeable` TINYINT(1) NOT NULL DEFAULT 0,
  `currency_id` VARCHAR(36) NOT NULL,
  `created_at` timestamp(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` timestamp(3)
);

CREATE TABLE `interest_payment` (
  `id` VARCHAR(36) PRIMARY KEY NOT NULL DEFAULT (UUID()),
  `date_time` timestamp(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `interest_rate` double precision NOT NULL,
  `exchange_rate` double precision NOT NULL,
  `total_accounts` integer NOT NULL DEFAULT 0,
  `total_interest_amount` numeric(65,30) NOT NULL DEFAULT 0,
  `highest_interest_amount` numeric(65,30) NOT NULL DEFAULT 0,
  `lowest_interest_amount` numeric(65,30) NOT NULL DEFAULT 0,
  `average_interest_amount` numeric(65,30) NOT NULL DEFAULT 0,
  `from_wallet_id` VARCHAR(36) NOT NULL,
  `to_wallet_id` VARCHAR(36) NOT NULL,
  `created_at` timestamp(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` timestamp(3)
);

CREATE TABLE `interest_payment_account` (
  `from_wallet_amount` numeric(65,30) NOT NULL,
  `to_wallet_amount` numeric(65,30) NOT NULL,
  `from_interest_amount` numeric(65,30) NOT NULL,
  `to_interest_amount` numeric(65,30) NOT NULL,
  `interest_payment_id` VARCHAR(36) NOT NULL,
  `account_id` VARCHAR(36) NOT NULL,
  `cashback_transaction_id` VARCHAR(36),
  `created_at` timestamp(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` timestamp(3),
  PRIMARY KEY (`interest_payment_id`, `account_id`)
);

CREATE TABLE `job_campaign_history` (
  `id` VARCHAR(36) PRIMARY KEY NOT NULL DEFAULT (UUID()),
  `message` VARCHAR(255),
  `created_at` timestamp(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `account_id` VARCHAR(36),
  `campaign_id` VARCHAR(36)
);

CREATE TABLE `kai_transaction` (
  `id` VARCHAR(36) PRIMARY KEY NOT NULL DEFAULT (UUID()),
  `status` smallint NOT NULL DEFAULT 1,
  `tx_hash` text NOT NULL,
  `wallet_address` text NOT NULL,
  `kai_json` TEXT,
  `cashback_transaction_id` VARCHAR(36) NOT NULL,
  `created_at` timestamp(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` timestamp(3)
);


-- Bảng này giúp quản lý việc gửi và theo dõi các thông báo gửi đến từng người dùng một cách rõ ràng và có tổ chức
CREATE TABLE `notification` (
  `id` VARCHAR(36) PRIMARY KEY NOT NULL DEFAULT (UUID()),
  `type` smallint NOT NULL, --  Kiểu của thông báo, sử dụng số nguyên nhỏ (smallint) để xác định loại thông báo (ví dụ: 1 - cảnh báo, 2 - khuyến mãi, 3 - cập nhật, v.v.).
  `icon` VARCHAR(255), -- Đường dẫn hoặc ký tự đại diện cho biểu tượng của thông báo, giúp hiển thị phù hợp với nội dung.
  `seen` TINYINT(1) NOT NULL DEFAULT 0, -- Trạng thái đã xem của thông báo. Nếu false, nghĩa là người dùng chưa xem thông báo; true là đã xem.
  `title` VARCHAR(255) NOT NULL, -- Tiêu đề của thông báo, là đoạn văn bản ngắn mô tả nội dung chính.
  `description` VARCHAR(500) NOT NULL, -- Nội dung chi tiết của thông báo
  `created_at` timestamp(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP), -- Thời gian tạo thông báo
  `html_content` text, -- Nội dung HTML tùy chỉnh để hiển thị thông báo với định dạng phong phú
  `ref` VARCHAR(36), -- Mã định danh để tham chiếu đến một đối tượng liên quan, ví dụ như ID của một giao dịch hoặc một đối tượng khác.
  `account_id` VARCHAR(36) NOT NULL -- Mã định danh của tài khoản người dùng nhận thông báo.
);

CREATE TABLE `partner_transaction` (
  `order_id` VARCHAR(36) PRIMARY KEY NOT NULL DEFAULT (UUID()), -- lưu trữ mã đơn hàng
  `amount` numeric(65,30) NOT NULL DEFAULT 0, -- Giá trị số tiền của giao dịch, với độ chính xác rất cao
  `status` smallint NOT NULL DEFAULT 1,
  `vndc_receiver` VARCHAR(50), -- Lưu trữ thông tin người nhận tiền VNDC
  `title` VARCHAR(150),
  `description` VARCHAR(255),
  `store_id` VARCHAR(50), -- Mã của cửa hàng liên quan đến giao dịch
  `payme_id` VARCHAR(20), -- Mã PayMe liên quan đến giao dịch
  `created_at` timestamp(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` timestamp(3),
  `account_id` VARCHAR(36) NOT NULL, -- Mã tài khoản liên quan đến giao dịch
  `amount_exchange` numeric(65,30) NOT NULL DEFAULT 0, -- Giá trị số tiền sau khi được chuyển đổi, với độ chính xác cao
  `partner_type` smallint NOT NULL DEFAULT 1, -- Loại đối tác liên quan đến giao dịch
  `histories` TEXT,
  `method_type` smallint NOT NULL DEFAULT 1, -- Loại phương thức thanh toán của giao dịc
  `type` smallint NOT NULL DEFAULT 1, -- Loại giao dịch, ví dụ như nạp tiền, rút tiền, chuyển khoản, 
  `transaction_id` VARCHAR(32), -- Mã giao dịch liên quan
  `exchange_rate` double precision NOT NULL DEFAULT 0, -- Tỷ giá chuyển đổi, lưu trữ dưới dạng double precision
  `currency_id` VARCHAR(36) -- Mã của loại tiền tệ được sử dụng trong giao dịch, 
);

CREATE TABLE `pool_bbc_history` (
  `id` VARCHAR(36) PRIMARY KEY NOT NULL DEFAULT (UUID()),
  `in` numeric(65,30) NOT NULL DEFAULT 0,
  `out` numeric(65,30) NOT NULL DEFAULT 0,
  `last` numeric(65,30) NOT NULL DEFAULT 0,
  `time` VARCHAR(10) NOT NULL DEFAULT ('00:00:00'),
  `date` VARCHAR(10) NOT NULL DEFAULT ('01/01/1970'),
  `created_at` timestamp(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` timestamp(3),
  `pool_id` VARCHAR(36) NOT NULL
);

CREATE TABLE `pool_config` (
  `id` VARCHAR(36) PRIMARY KEY NOT NULL DEFAULT (UUID()),
  `revenue` double precision NOT NULL DEFAULT 30,
  `min` integer NOT NULL DEFAULT 10000,
  `max` integer NOT NULL DEFAULT 100000,
  `created_at` timestamp(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` timestamp(3),
  `updated_id` VARCHAR(36)
);

CREATE TABLE `pool_egg_history` (
  `id` VARCHAR(36) PRIMARY KEY NOT NULL DEFAULT (UUID()),
  `in` numeric(65,30) NOT NULL DEFAULT 0,
  `out` numeric(65,30) NOT NULL DEFAULT 0,
  `last` numeric(65,30) NOT NULL DEFAULT 0,
  `time` VARCHAR(10) NOT NULL DEFAULT ('00:00:00'),
  `date` VARCHAR(10) NOT NULL DEFAULT ('01/01/1970'),
  `created_at` timestamp(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` timestamp(3),
  `pool_id` VARCHAR(36) NOT NULL
);

CREATE TABLE `pool_rate_history` (
  `id` VARCHAR(36) PRIMARY KEY NOT NULL DEFAULT (UUID()),
  `value` double precision NOT NULL DEFAULT 0,
  `time` VARCHAR(10) NOT NULL DEFAULT ('00:00:00'),
  `date` VARCHAR(10) NOT NULL DEFAULT ('01/01/1970'),
  `created_at` timestamp(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `pool_id` VARCHAR(36) NOT NULL
);

CREATE TABLE `pool_value` (
  `id` VARCHAR(36) PRIMARY KEY NOT NULL DEFAULT (UUID()),
  `egg_value` numeric(65,30) NOT NULL DEFAULT 1000000000,
  `bbc_value` numeric(65,30) NOT NULL DEFAULT 10000000,
  `created_at` timestamp(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` timestamp(3),
  `updated_id` VARCHAR(36)
);

CREATE TABLE `referral_ranking` (
  `id` VARCHAR(36) PRIMARY KEY NOT NULL DEFAULT (UUID()),
  `title` text NOT NULL,
  `description` text,
  `time_start` bigint NOT NULL DEFAULT 0,
  `time_end` bigint NOT NULL DEFAULT 0,
  `total_prize` numeric(65,30) NOT NULL DEFAULT 0,
  `is_public` TINYINT(1) NOT NULL DEFAULT 0,
  `prize_rate` TEXT,
  `currency_id` VARCHAR(36) NOT NULL,
  `created_at` timestamp(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` timestamp(3),
  `status` smallint NOT NULL DEFAULT 1
);

CREATE TABLE `referral_ranking_account` (
  `rank` integer NOT NULL,
  `referral_count` integer NOT NULL DEFAULT 0,
  `prize_amount` numeric(65,30) NOT NULL DEFAULT 0,
  `prize_rate` double precision NOT NULL,
  `awarded_at` timestamp(3),
  `created_at` timestamp(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` timestamp(3),
  `account_id` VARCHAR(36) NOT NULL,
  `referral_ranking_id` VARCHAR(36) NOT NULL,
  `cashback_transaction_id` VARCHAR(36),
  `kyc_count` integer NOT NULL DEFAULT 0,
  PRIMARY KEY (`account_id`, `referral_ranking_id`)
);

CREATE TABLE `user` (
  `id` VARCHAR(36) PRIMARY KEY NOT NULL DEFAULT (UUID()),
  `user_name` VARCHAR(50) NOT NULL,
  `password` VARCHAR(100) NOT NULL,
  `full_name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(50),
  `phone` VARCHAR(20),
  `avatar` VARCHAR(150),
  `role` smallint,
  `status` smallint DEFAULT 1,
  `created_by` VARCHAR(36),
  `created_at` timestamp(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` timestamp(3),
  `deleted_at` timestamp(3)
);

CREATE TABLE `vndc_transaction` (
  `id` VARCHAR(36) PRIMARY KEY NOT NULL DEFAULT (UUID()),
  `status` smallint NOT NULL DEFAULT 1,
  `vndc_transaction_number` text,
  `vndc_fullname` text,
  `vndc_username` text,
  `vndc_json` TEXT,
  `wallet_address` text NOT NULL,
  `cashback_transaction_id` VARCHAR(36) NOT NULL,
  `created_at` timestamp(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` timestamp(3)
);

CREATE UNIQUE INDEX `account.email_unique` ON `account` (`email`) USING BTREE;

CREATE UNIQUE INDEX `account.phone_unique` ON `account` (`phone`) USING BTREE;

CREATE UNIQUE INDEX `account.referral_code_unique` ON `account` (`referral_code`) USING BTREE;

CREATE INDEX `account_daily_lucky_wheel.account_id_index` ON `account_daily_lucky_wheel` (`account_id`) USING BTREE;

CREATE UNIQUE INDEX `account_daily_lucky_wheel.transaction_id_unique` ON `account_daily_lucky_wheel` (`transaction_id`) USING BTREE;

CREATE INDEX `account_partner_commission.account_id_index` ON `account_partner_commission` (`account_id`) USING BTREE;

CREATE UNIQUE INDEX `account_partner_commission.transaction_id_unique` ON `account_partner_commission` (`transaction_id`) USING BTREE;

CREATE UNIQUE INDEX `account_referral.referral_from_unique` ON `account_referral` (`referral_from`) USING BTREE;

CREATE UNIQUE INDEX `account_referral_stats.account_id_unique` ON `account_referral_stats` (`account_id`) USING BTREE;

CREATE INDEX `account_reward_event.account_id_index` ON `account_reward_event` (`account_id`) USING BTREE;

CREATE INDEX `account_reward_event.event_id_index` ON `account_reward_event` (`event_id`) USING BTREE;

CREATE UNIQUE INDEX `account_setting.account_id_unique` ON `account_setting` (`account_id`) USING BTREE;

CREATE UNIQUE INDEX `account_summary.day_month_year_unique` ON `account_summary` (`day`, `month`, `year`) USING BTREE;

CREATE UNIQUE INDEX `bonus_event_account.cashback_transaction_id_unique` ON `bonus_event_account` (`cashback_transaction_id`) USING BTREE;

CREATE UNIQUE INDEX `cashback_available.currency_id_account_id_unique` ON `cashback_available` (`currency_id`, `account_id`) USING BTREE;

CREATE INDEX `cashback_available_histories.ca_id_index` ON `cashback_available_histories` (`ca_id`) USING BTREE;

CREATE UNIQUE INDEX `cashback_summary.day_month_year_status_type_unique` ON `cashback_summary` (`day`, `month`, `year`, `status`, `type`) USING BTREE;

CREATE INDEX `cashback_transaction.currency_id_index` ON `cashback_transaction` (`currency_id`) USING BTREE;

CREATE INDEX `cashback_transaction.receiver_id_index` ON `cashback_transaction` (`receiver_id`) USING BTREE;

CREATE INDEX `cashback_transaction.sender_id_index` ON `cashback_transaction` (`sender_id`) USING BTREE;

CREATE INDEX `cashback_transaction_broker.currency_id_index` ON `cashback_transaction_broker` (`currency_id`) USING BTREE;

CREATE INDEX `cashback_transaction_broker.receiver_id_index` ON `cashback_transaction_broker` (`receiver_id`) USING BTREE;

CREATE INDEX `cashback_transaction_broker.sender_id_index` ON `cashback_transaction_broker` (`sender_id`) USING BTREE;

CREATE UNIQUE INDEX `chicken_farm_adult.chicken_no_unique` ON `chicken_farm_adult` (`chicken_no`) USING BTREE;

CREATE UNIQUE INDEX `chicken_farm_adult.egg_id_unique` ON `chicken_farm_adult` (`egg_id`) USING BTREE;

CREATE INDEX `chicken_farm_adult.owner_id_index` ON `chicken_farm_adult` (`owner_id`) USING BTREE;

CREATE UNIQUE INDEX `chicken_farm_breed.hen_id_rooster_id_unique` ON `chicken_farm_breed` (`hen_id`, `rooster_id`) USING BTREE;

CREATE UNIQUE INDEX `chicken_farm_breed.hen_id_unique` ON `chicken_farm_breed` (`hen_id`) USING BTREE;

CREATE INDEX `chicken_farm_egg.breed_id_index` ON `chicken_farm_egg` (`breed_id`) USING BTREE;

CREATE INDEX `chicken_farm_egg.egg_event_id_index` ON `chicken_farm_egg` (`egg_event_id`) USING BTREE;

CREATE INDEX `chicken_farm_egg.owner_id_index` ON `chicken_farm_egg` (`owner_id`) USING BTREE;

CREATE INDEX `chicken_farm_market.buyer_id_index` ON `chicken_farm_market` (`buyer_id`) USING BTREE;

CREATE INDEX `chicken_farm_market.chicken_id_index` ON `chicken_farm_market` (`chicken_id`) USING BTREE;

CREATE INDEX `chicken_farm_market.egg_id_index` ON `chicken_farm_market` (`egg_id`) USING BTREE;

CREATE INDEX `chicken_farm_market.rooster_id_index` ON `chicken_farm_market` (`rooster_id`) USING BTREE;

CREATE INDEX `chicken_farm_market.seller_id_index` ON `chicken_farm_market` (`seller_id`) USING BTREE;

CREATE UNIQUE INDEX `chicken_farm_rooster.chicken_no_unique` ON `chicken_farm_rooster` (`chicken_no`) USING BTREE;

CREATE UNIQUE INDEX `chicken_farm_rooster.egg_id_unique` ON `chicken_farm_rooster` (`egg_id`) USING BTREE;

CREATE INDEX `chicken_farm_rooster.owner_id_index` ON `chicken_farm_rooster` (`owner_id`) USING BTREE;

CREATE INDEX `chicken_farm_transaction.buyer_id_index` ON `chicken_farm_transaction` (`buyer_id`) USING BTREE;

CREATE INDEX `chicken_farm_transaction.currency_id_index` ON `chicken_farm_transaction` (`currency_id`) USING BTREE;

CREATE INDEX `chicken_farm_transaction.market_id_index` ON `chicken_farm_transaction` (`market_id`) USING BTREE;

CREATE UNIQUE INDEX `chicken_farm_transaction.market_id_unique` ON `chicken_farm_transaction` (`market_id`) USING BTREE;

CREATE INDEX `chicken_farm_transaction.seller_id_index` ON `chicken_farm_transaction` (`seller_id`) USING BTREE;

CREATE UNIQUE INDEX `currency_limit_setting.type_currency_id_unique` ON `currency_limit_setting` (`type`, `currency_id`) USING BTREE;

CREATE UNIQUE INDEX `currency_master.code_unique` ON `currency_master` (`code`) USING BTREE;

CREATE UNIQUE INDEX `golden_egg_exchange_setting.currency_id_unique` ON `golden_egg_exchange_setting` (`currency_id`) USING BTREE;

CREATE INDEX `interest_payment.date_time_from_wallet_id_to_wallet_id_index` ON `interest_payment` (`date_time`, `from_wallet_id`, `to_wallet_id`) USING BTREE;

CREATE UNIQUE INDEX `interest_payment_account.cashback_transaction_id_unique` ON `interest_payment_account` (`cashback_transaction_id`) USING BTREE;

CREATE INDEX `interest_payment_account.interest_payment_id_account_id_cashbac` ON `interest_payment_account` (`interest_payment_id`, `account_id`, `cashback_transaction_id`) USING BTREE;

CREATE UNIQUE INDEX `kai_transaction.cashback_transaction_id_unique` ON `kai_transaction` (`cashback_transaction_id`) USING BTREE;

CREATE UNIQUE INDEX `kai_transaction.tx_hash_unique` ON `kai_transaction` (`tx_hash`(100)) USING BTREE;

CREATE UNIQUE INDEX `partner_transaction.transaction_id_unique` ON `partner_transaction` (`transaction_id`) USING BTREE;

CREATE INDEX `pool_bbc_history.created_at_index` ON `pool_bbc_history` (`created_at`) USING BTREE;

CREATE INDEX `pool_bbc_history.pool_id_index` ON `pool_bbc_history` (`pool_id`) USING BTREE;

CREATE INDEX `pool_egg_history.created_at_index` ON `pool_egg_history` (`created_at`) USING BTREE;

CREATE INDEX `pool_egg_history.pool_id_index` ON `pool_egg_history` (`pool_id`) USING BTREE;

CREATE INDEX `pool_rate_history.created_at_index` ON `pool_rate_history` (`created_at`) USING BTREE;

CREATE INDEX `pool_rate_history.pool_id_index` ON `pool_rate_history` (`pool_id`) USING BTREE;

CREATE UNIQUE INDEX `referral_ranking_account.cashback_transaction_id_unique` ON `referral_ranking_account` (`cashback_transaction_id`) USING BTREE;

CREATE UNIQUE INDEX `user.email_unique` ON `user` (`email`) USING BTREE;

CREATE UNIQUE INDEX `user.user_name_unique` ON `user` (`user_name`) USING BTREE;

CREATE UNIQUE INDEX `vndc_transaction.cashback_transaction_id_unique` ON `vndc_transaction` (`cashback_transaction_id`) USING BTREE;

CREATE UNIQUE INDEX `vndc_transaction.vndc_transaction_number_unique` ON `vndc_transaction` (`vndc_transaction_number`(100)) USING BTREE;

ALTER TABLE `posts` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

ALTER TABLE `follows` ADD FOREIGN KEY (`following_user_id`) REFERENCES `users` (`id`);

ALTER TABLE `follows` ADD FOREIGN KEY (`followed_user_id`) REFERENCES `users` (`id`);

ALTER TABLE `account_contact` ADD CONSTRAINT `account_contact_contact_id_fkey` FOREIGN KEY (`contact_id`) REFERENCES `account` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `account_daily_lucky_wheel` ADD CONSTRAINT `account_daily_lucky_wheel_account_id_fkey` FOREIGN KEY (`account_id`) REFERENCES `account` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `account_daily_lucky_wheel_history` ADD CONSTRAINT `account_daily_lucky_wheel_history_daily_reward_id_fkey` FOREIGN KEY (`daily_reward_id`) REFERENCES `account_daily_lucky_wheel` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `account_daily_lucky_wheel` ADD CONSTRAINT `account_daily_lucky_wheel_transaction_id_fkey` FOREIGN KEY (`transaction_id`) REFERENCES `cashback_transaction` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `account_exchange_currency` ADD CONSTRAINT `account_exchange_currency_account_id_fkey` FOREIGN KEY (`account_id`) REFERENCES `account` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `account_exchange_currency` ADD CONSTRAINT `account_exchange_currency_currency_id_fkey` FOREIGN KEY (`currency_id`) REFERENCES `currency_master` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `account_history` ADD CONSTRAINT `account_history_account_id_fkey` FOREIGN KEY (`account_id`) REFERENCES `account` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `account_history` ADD CONSTRAINT `account_history_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `account_kyc_ipn` ADD CONSTRAINT `account_kyc_ipn_account_id_fkey` FOREIGN KEY (`account_id`) REFERENCES `account` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `account_partner_commission` ADD CONSTRAINT `account_partner_commission_account_id_fkey` FOREIGN KEY (`account_id`) REFERENCES `account` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `account_partner_commission` ADD CONSTRAINT `account_partner_commission_transaction_id_fkey` FOREIGN KEY (`transaction_id`) REFERENCES `cashback_transaction` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `account_referral` ADD CONSTRAINT `account_referral_referral_by_fkey` FOREIGN KEY (`referral_by`) REFERENCES `account` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `account_referral` ADD CONSTRAINT `account_referral_referral_from_fkey` FOREIGN KEY (`referral_from`) REFERENCES `account` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `account_referral_stats` ADD CONSTRAINT `account_referral_stats_account_id_fkey` FOREIGN KEY (`account_id`) REFERENCES `account` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `account_reward_event` ADD CONSTRAINT `account_reward_event_account_id_fkey` FOREIGN KEY (`account_id`) REFERENCES `account` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `account_reward_event` ADD CONSTRAINT `account_reward_event_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `config_event` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `account_setting` ADD CONSTRAINT `account_setting_account_id_fkey` FOREIGN KEY (`account_id`) REFERENCES `account` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `bonus_event_account` ADD CONSTRAINT `bonus_event_account_account_id_fkey` FOREIGN KEY (`account_id`) REFERENCES `account` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `bonus_event_account` ADD CONSTRAINT `bonus_event_account_bonus_event_id_fkey` FOREIGN KEY (`bonus_event_id`) REFERENCES `bonus_event` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `bonus_event_account` ADD CONSTRAINT `bonus_event_account_cashback_transaction_id_fkey` FOREIGN KEY (`cashback_transaction_id`) REFERENCES `cashback_transaction` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `bonus_event` ADD CONSTRAINT `bonus_event_broker_id_fkey` FOREIGN KEY (`broker_id`) REFERENCES `account` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `bonus_event` ADD CONSTRAINT `bonus_event_created_id_fkey` FOREIGN KEY (`created_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `bonus_event` ADD CONSTRAINT `bonus_event_currency_id_fkey` FOREIGN KEY (`currency_id`) REFERENCES `currency_master` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `bonus_event` ADD CONSTRAINT `bonus_event_updated_id_fkey` FOREIGN KEY (`updated_id`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `campaign_category` ADD CONSTRAINT `campaign_category_campaign_id_fkey` FOREIGN KEY (`campaign_id`) REFERENCES `campaign` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `campaign` ADD CONSTRAINT `campaign_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `category_master` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `cashback_available` ADD CONSTRAINT `cashback_available_account_id_fkey` FOREIGN KEY (`account_id`) REFERENCES `account` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `cashback_available` ADD CONSTRAINT `cashback_available_currency_id_fkey` FOREIGN KEY (`currency_id`) REFERENCES `currency_master` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `cashback_available_histories` ADD CONSTRAINT `cashback_available_histories_ca_id_fkey` FOREIGN KEY (`ca_id`) REFERENCES `cashback_available` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `cashback_transaction_broker` ADD CONSTRAINT `cashback_transaction_broker_currency_id_fkey` FOREIGN KEY (`currency_id`) REFERENCES `currency_master` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `cashback_transaction_broker` ADD CONSTRAINT `cashback_transaction_broker_receiver_id_fkey` FOREIGN KEY (`receiver_id`) REFERENCES `account` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `cashback_transaction_broker` ADD CONSTRAINT `cashback_transaction_broker_sender_id_fkey` FOREIGN KEY (`sender_id`) REFERENCES `account` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `cashback_transaction` ADD CONSTRAINT `cashback_transaction_campaign_id_fkey` FOREIGN KEY (`campaign_id`) REFERENCES `campaign` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `cashback_transaction` ADD CONSTRAINT `cashback_transaction_currency_id_fkey` FOREIGN KEY (`currency_id`) REFERENCES `currency_master` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `cashback_transaction` ADD CONSTRAINT `cashback_transaction_receiver_id_fkey` FOREIGN KEY (`receiver_id`) REFERENCES `account` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `cashback_transaction` ADD CONSTRAINT `cashback_transaction_sender_id_fkey` FOREIGN KEY (`sender_id`) REFERENCES `account` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `chicken_farm_adult` ADD CONSTRAINT `chicken_farm_adult_egg_id_fkey` FOREIGN KEY (`egg_id`) REFERENCES `chicken_farm_egg` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `chicken_farm_adult` ADD CONSTRAINT `chicken_farm_adult_owner_id_fkey` FOREIGN KEY (`owner_id`) REFERENCES `account` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `chicken_farm_breed` ADD CONSTRAINT `chicken_farm_breed_hen_id_fkey` FOREIGN KEY (`hen_id`) REFERENCES `chicken_farm_adult` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `chicken_farm_breed` ADD CONSTRAINT `chicken_farm_breed_rooster_id_fkey` FOREIGN KEY (`rooster_id`) REFERENCES `chicken_farm_rooster` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `chicken_farm_egg` ADD CONSTRAINT `chicken_farm_egg_breed_id_fkey` FOREIGN KEY (`breed_id`) REFERENCES `chicken_farm_breed` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `chicken_farm_egg` ADD CONSTRAINT `chicken_farm_egg_egg_event_id_fkey` FOREIGN KEY (`egg_event_id`) REFERENCES `chicken_farm_egg_event` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `chicken_farm_egg_event` ADD CONSTRAINT `chicken_farm_egg_event_created_id_fkey` FOREIGN KEY (`created_id`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `chicken_farm_egg_event` ADD CONSTRAINT `chicken_farm_egg_event_currency_id_fkey` FOREIGN KEY (`currency_id`) REFERENCES `currency_master` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `chicken_farm_egg_harvest` ADD CONSTRAINT `chicken_farm_egg_harvest_chicken_id_fkey` FOREIGN KEY (`chicken_id`) REFERENCES `chicken_farm_adult` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `chicken_farm_egg_harvest` ADD CONSTRAINT `chicken_farm_egg_harvest_owner_id_fkey` FOREIGN KEY (`owner_id`) REFERENCES `account` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `chicken_farm_egg` ADD CONSTRAINT `chicken_farm_egg_owner_id_fkey` FOREIGN KEY (`owner_id`) REFERENCES `account` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `chicken_farm_extra_slot` ADD CONSTRAINT `chicken_farm_extra_slot_owner_id_fkey` FOREIGN KEY (`owner_id`) REFERENCES `account` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `chicken_farm_market` ADD CONSTRAINT `chicken_farm_market_buyer_id_fkey` FOREIGN KEY (`buyer_id`) REFERENCES `account` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `chicken_farm_market` ADD CONSTRAINT `chicken_farm_market_chicken_id_fkey` FOREIGN KEY (`chicken_id`) REFERENCES `chicken_farm_adult` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `chicken_farm_market` ADD CONSTRAINT `chicken_farm_market_currency_id_fkey` FOREIGN KEY (`currency_id`) REFERENCES `currency_master` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `chicken_farm_market` ADD CONSTRAINT `chicken_farm_market_egg_id_fkey` FOREIGN KEY (`egg_id`) REFERENCES `chicken_farm_egg` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `chicken_farm_market` ADD CONSTRAINT `chicken_farm_market_rooster_id_fkey` FOREIGN KEY (`rooster_id`) REFERENCES `chicken_farm_rooster` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `chicken_farm_market` ADD CONSTRAINT `chicken_farm_market_seller_id_fkey` FOREIGN KEY (`seller_id`) REFERENCES `account` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `chicken_farm_rooster` ADD CONSTRAINT `chicken_farm_rooster_egg_id_fkey` FOREIGN KEY (`egg_id`) REFERENCES `chicken_farm_egg` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `chicken_farm_rooster` ADD CONSTRAINT `chicken_farm_rooster_owner_id_fkey` FOREIGN KEY (`owner_id`) REFERENCES `account` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `chicken_farm_transaction` ADD CONSTRAINT `chicken_farm_transaction_buyer_id_fkey` FOREIGN KEY (`buyer_id`) REFERENCES `account` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `chicken_farm_transaction` ADD CONSTRAINT `chicken_farm_transaction_currency_id_fkey` FOREIGN KEY (`currency_id`) REFERENCES `currency_master` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `chicken_farm_transaction` ADD CONSTRAINT `chicken_farm_transaction_market_id_fkey` FOREIGN KEY (`market_id`) REFERENCES `chicken_farm_market` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `chicken_farm_transaction` ADD CONSTRAINT `chicken_farm_transaction_seller_id_fkey` FOREIGN KEY (`seller_id`) REFERENCES `account` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `config_ads` ADD CONSTRAINT `config_ads_created_id_fkey` FOREIGN KEY (`created_id`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `config_daily_lucky_wheel` ADD CONSTRAINT `config_daily_lucky_wheel_currency_id_fkey` FOREIGN KEY (`currency_id`) REFERENCES `currency_master` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `config_daily_lucky_wheel` ADD CONSTRAINT `config_daily_lucky_wheel_updated_id_fkey` FOREIGN KEY (`updated_id`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `config_event` ADD CONSTRAINT `config_event_created_id_fkey` FOREIGN KEY (`created_id`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `config_event` ADD CONSTRAINT `config_event_currency_id_fkey` FOREIGN KEY (`currency_id`) REFERENCES `currency_master` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `config_interest_rate` ADD CONSTRAINT `config_interest_rate_from_wallet_id_fkey` FOREIGN KEY (`from_wallet_id`) REFERENCES `currency_master` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `config_interest_rate_history` ADD CONSTRAINT `config_interest_rate_history_config_interest_rate_id_fkey` FOREIGN KEY (`config_interest_rate_id`) REFERENCES `config_interest_rate` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `config_interest_rate_history` ADD CONSTRAINT `config_interest_rate_history_updated_by_id_fkey` FOREIGN KEY (`updated_by_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `config_interest_rate` ADD CONSTRAINT `config_interest_rate_updated_id_fkey` FOREIGN KEY (`updated_id`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `config_interest_rate` ADD CONSTRAINT `config_interest_rate_wallet_receive_id_fkey` FOREIGN KEY (`wallet_receive_id`) REFERENCES `currency_master` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `config_payment_lucky_wheel` ADD CONSTRAINT `config_payment_lucky_wheel_currency_id_fkey` FOREIGN KEY (`currency_id`) REFERENCES `currency_master` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `config_payment_lucky_wheel` ADD CONSTRAINT `config_payment_lucky_wheel_updated_id_fkey` FOREIGN KEY (`updated_id`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `config` ADD CONSTRAINT `config_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `currency_limit_setting` ADD CONSTRAINT `currency_limit_setting_currency_id_fkey` FOREIGN KEY (`currency_id`) REFERENCES `currency_master` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `event` ADD CONSTRAINT `event_created_id_fkey` FOREIGN KEY (`created_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `event` ADD CONSTRAINT `event_updated_id_fkey` FOREIGN KEY (`updated_id`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `golden_egg_exchange_setting` ADD CONSTRAINT `golden_egg_exchange_setting_currency_id_fkey` FOREIGN KEY (`currency_id`) REFERENCES `currency_master` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `interest_payment_account` ADD CONSTRAINT `interest_payment_account_account_id_fkey` FOREIGN KEY (`account_id`) REFERENCES `account` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `interest_payment_account` ADD CONSTRAINT `interest_payment_account_cashback_transaction_id_fkey` FOREIGN KEY (`cashback_transaction_id`) REFERENCES `cashback_transaction` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `interest_payment_account` ADD CONSTRAINT `interest_payment_account_interest_payment_id_fkey` FOREIGN KEY (`interest_payment_id`) REFERENCES `interest_payment` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `interest_payment` ADD CONSTRAINT `interest_payment_from_wallet_id_fkey` FOREIGN KEY (`from_wallet_id`) REFERENCES `currency_master` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `interest_payment` ADD CONSTRAINT `interest_payment_to_wallet_id_fkey` FOREIGN KEY (`to_wallet_id`) REFERENCES `currency_master` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `job_campaign_history` ADD CONSTRAINT `job_campaign_history_account_id_fkey` FOREIGN KEY (`account_id`) REFERENCES `account` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `job_campaign_history` ADD CONSTRAINT `job_campaign_history_campaign_id_fkey` FOREIGN KEY (`campaign_id`) REFERENCES `campaign` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `kai_transaction` ADD CONSTRAINT `kai_transaction_cashback_transaction_id_fkey` FOREIGN KEY (`cashback_transaction_id`) REFERENCES `cashback_transaction` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `notification` ADD CONSTRAINT `notification_account_id_fkey` FOREIGN KEY (`account_id`) REFERENCES `account` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `partner_transaction` ADD CONSTRAINT `partner_transaction_account_id_fkey` FOREIGN KEY (`account_id`) REFERENCES `account` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `partner_transaction` ADD CONSTRAINT `partner_transaction_currency_id_fkey` FOREIGN KEY (`currency_id`) REFERENCES `currency_master` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `pool_bbc_history` ADD CONSTRAINT `pool_bbc_history_pool_id_fkey` FOREIGN KEY (`pool_id`) REFERENCES `pool_value` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `pool_config` ADD CONSTRAINT `pool_config_updated_id_fkey` FOREIGN KEY (`updated_id`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `pool_egg_history` ADD CONSTRAINT `pool_egg_history_pool_id_fkey` FOREIGN KEY (`pool_id`) REFERENCES `pool_value` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `pool_rate_history` ADD CONSTRAINT `pool_rate_history_pool_id_fkey` FOREIGN KEY (`pool_id`) REFERENCES `pool_value` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `pool_value` ADD CONSTRAINT `pool_value_updated_id_fkey` FOREIGN KEY (`updated_id`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `referral_ranking_account` ADD CONSTRAINT `referral_ranking_account_account_id_fkey` FOREIGN KEY (`account_id`) REFERENCES `account` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `referral_ranking_account` ADD CONSTRAINT `referral_ranking_account_cashback_transaction_id_fkey` FOREIGN KEY (`cashback_transaction_id`) REFERENCES `cashback_transaction` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `referral_ranking_account` ADD CONSTRAINT `referral_ranking_account_referral_ranking_id_fkey` FOREIGN KEY (`referral_ranking_id`) REFERENCES `referral_ranking` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `referral_ranking` ADD CONSTRAINT `referral_ranking_currency_id_fkey` FOREIGN KEY (`currency_id`) REFERENCES `currency_master` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `vndc_transaction` ADD CONSTRAINT `vndc_transaction_cashback_transaction_id_fkey` FOREIGN KEY (`cashback_transaction_id`) REFERENCES `cashback_transaction` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;