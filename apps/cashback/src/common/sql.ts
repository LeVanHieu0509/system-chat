export const CB_EXCHANGE_INQUIRY_SQL = `
SELECT
    cm.code,
    FLOOR(ca.amount) AS "cbAvailable",
    COALESCE(
        (SELECT FLOOR(SUM(amount)) 
         FROM cashback_transaction 
         WHERE type = 5 
           AND status IN (1, 2, 5) 
           AND created_at >= ? 
           AND sender_id = ?), 
        0
    ) AS "amountInDay",
    COALESCE(
        (SELECT FLOOR(SUM(amount)) 
         FROM cashback_transaction 
         WHERE type = 5 
           AND status IN (1, 2, 5) 
           AND created_at >= ? 
           AND sender_id = ?), 
        0
    ) AS "amountInMonth"
FROM currency_master cm
JOIN cashback_available ca ON ca.currency_id = cm.id
JOIN account a ON a.id = ca.account_id
WHERE a.id = ? 
  AND a.kyc_status = 2 
  AND cm.id = ?;
`;
