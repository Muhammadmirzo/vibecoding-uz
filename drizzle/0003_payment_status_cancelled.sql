-- Adds the 'cancelled' value to payment_status (Payme CancelTransaction path).
-- Kept in its own migration on purpose: PostgreSQL forbids
-- ALTER TYPE ... ADD VALUE inside a transaction block, so this statement
-- must be applied separately from the transactional DDL in 0002.
ALTER TYPE "public"."payment_status" ADD VALUE 'cancelled';
