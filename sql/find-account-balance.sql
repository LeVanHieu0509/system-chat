-- Đây là một câu truy vấn SQL phức tạp để tính toán số dư (balance) 
-- của một tài khoản dựa trên các giao dịch incoming (nhận tiền) 
-- và outgoing (gửi tiền) cho một tài khoản cụ thể

select
    a.id,
    a.device_token as "deviceToken",
    ca.version,
    -- Lấy amount từ bảng cashback_available và làm tròn xuống (floor).
    floor(ca.amount) as "amount", 
    -- Sử dụng coalesce để xử lý các giá trị null và thay thế bằng 0 nếu không có giao dịch incoming hoặc outgoing.
    floor(coalesce(sum_incoming.total_amount, 0)) as "incoming", 
    floor(coalesce(sum_outgoing.total_amount, 0)) as "outgoing",
    -- Tính số dư bằng cách lấy tổng incoming trừ đi outgoing và làm tròn kết quả.
    floor(sum(coalesce(sum_incoming.total_amount, 0) - coalesce(sum_outgoing.total_amount, 0))) as "balance"
from
    account a -- Bảng chính account lưu trữ thông tin tài khoản.

-- Thực hiện inner join với cashback_available (ca) để lấy thông tin cashback của tài khoản.
inner join cashback_available ca on
    ca.account_id = a.id

-- Giao dịch incoming:
left join (
    -- Lấy tất cả các giao dịch mà tài khoản là người nhận (receiver_id), status = 2, action_type = 1 (nhận tiền).
    select
        ct.receiver_id,
        -- Tổng số tiền của các giao dịch incoming.
        sum(ct.amount) as total_amount
    from
        cashback_transaction ct
    where
        ct.status = 2
        and ct.action_type = 1
        and ct.receiver_id = $1::uuid and ct.currency_id = $2::uuid
    group by ct.receiver_id) as sum_incoming on
    a.id = sum_incoming.receiver_id

-- Giao dịch outgoing
left join (
    -- Tương tự, nhưng với tài khoản là người gửi (sender_id), status = 2, action_type = -1 (gửi tiền).
    select
        ct2.sender_id,
        -- Tính tổng tiền gửi, bao gồm cả phí (ct2.amount + ct2.fee).
        sum(ct2.amount + ct2.fee) as total_amount
    from
        cashback_transaction ct2
    where
        ct2.status = 2
        and ct2.action_type = -1
        and ct2.sender_id = $1::uuid and ct2.currency_id = $2::uuid
    group by ct2.sender_id) as sum_outgoing on
    a.id = sum_outgoing.sender_id
    -- Chỉ lấy thông tin tài khoản với id cụ thể và Lọc các tài khoản đang hoạt động và Lọc cashback_available theo loại tiền tệ
where a.id = $1::uuid and a.status = 1 and ca.currency_id = $2::uuid

-- Các cột group by gồm tất cả các cột không nằm trong hàm tổng hợp để đảm bảo dữ liệu chính xác
group by
    a.id,
    ca.amount,
    ca.currency_id,
    ca.version,
    sum_incoming.total_amount,
    sum_outgoing.total_amount;
