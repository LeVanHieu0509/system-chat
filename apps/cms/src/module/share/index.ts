import { CachingService } from '@app/caching';
import { AccountType, GMT_7, Order, STATUS } from '@app/common';
import { UtilsService } from '@app/utils';
import { Prisma } from '@prisma/client';
import { isPhoneNumber, isUUID } from 'class-validator';
import { AccountQueryDto } from '../account/account.dto';

type Token = { id: string; code: string };

const SortKeysAlias = {
  totalReferrals: 'ars."total_referrals"',
  totalKyc: 'ars."total_kyc"',
  [Prisma.AccountScalarFieldEnum.createdAt]: 'a.created_at',
};

export function buildAccountFilter(
  query: AccountQueryDto,
  tokens: Token[],
  isExport = false,
) {
  const {
    from,
    to,
    status,
    keyword,
    isPartner,
    kycStatus,
    sortKey,
    sortOrder,
    isReferral,
    token,
    value,
  } = query;
  const fromDate =
    from && new Date(new Date(from).setUTCHours(0, 0, 0, 0) - GMT_7);
  const toDate =
    to && new Date(new Date(to).setUTCHours(23, 59, 59, 59) - GMT_7);

  let whereClause = `a.type = '${AccountType.USER}' `;
  const values: any[] = [];
  if (kycStatus !== undefined) {
    values.push(kycStatus);
    whereClause += `and a.kyc_status = $${values.length} `;
  }
  if (status !== undefined) {
    values.push(status);
    whereClause += `and a.status = $${values.length} `;
  }
  if (isPartner !== undefined) {
    values.push(Boolean(isPartner));
    whereClause += `and a.is_partner = $${values.length} `;
  }
  if (keyword) {
    if (isUUID(keyword)) {
      values.push(keyword);
      whereClause += `and a."id" = $${values.length}::uuid `;
    } else if (isPhoneNumber(keyword, 'VN')) {
      const phone = UtilsService.getInstance().toIntlPhone(keyword);
      values.push(phone);
      whereClause += `and a."phone" = $${values.length} `;
    } else {
      values.push(`%${keyword}%`);
      whereClause += `and ( a."referral_code" ilike $${values.length} or a."email" ilike $${values.length} or a."phone" ilike $${values.length} or a."full_name" ilike $${values.length} or a.id::text ilike $${values.length}) `;
    }
  }
  if (fromDate) {
    whereClause += `and a.created_at >= '${fromDate.toISOString()}' `;
  }
  if (toDate) {
    whereClause += `and a.created_at <= '${toDate.toISOString()}' `;
  }
  if (isReferral !== undefined) {
    whereClause += `and ar2.referral_by is ${
      isReferral === 'true' ? 'not' : ''
    } null`;
  }

  let tokenFields = '';
  let tokenJoin = '';
  let orderBy = '';
  let sumFields = '';

  const orders = [`a."id" ${Order.ASC}`];
  const orderKey = SortKeysAlias[sortKey];
  if (orderKey) orders.unshift(`${orderKey} ${sortOrder}`);

  tokens.forEach((c, index) => {
    const alias = c.code.toLowerCase();
    const last = index === tokens.length - 1;
    const aliasColum = isExport
      ? `Số ${c.code} khả dụng`
      : `totalAmount${c.code}`;
    if (token === c.code && value) {
      const [operator, amount] = value.split(',');
      whereClause += ` and ${alias}.amount ${operator} ${amount}`;
    }
    tokenFields += `coalesce(${alias}.amount, 0) "${aliasColum}"${
      last ? '' : ',\n'
    }`;
    tokenJoin += `left join (select ca.amount, ca.account_id from cashback_available ca where ca.currency_id = '${
      c.id
    }') as ${alias} on ${alias}.account_id = a.id ${last ? '' : '\n'}`;
    sumFields += `floor(sum("${aliasColum}")) "${aliasColum}"${
      last ? '\n' : ',\n'
    }`;
    if (c.code === sortKey) {
      orders.unshift(`${alias}.amount ${sortOrder} NULLS LAST`);
    }
  });
  orderBy = orders.join(', ');

  return { whereClause, tokenFields, tokenJoin, orderBy, values, sumFields };
}

export async function getActiveTokens(
  tokenRepo: Prisma.CurrencyMasterDelegate<any>,
) {
  let tokens = await CachingService.getInstance().get<Token[]>('ACTIVE-TOKENS');
  if (tokens) return tokens;
  tokens = await tokenRepo.findMany({
    where: { status: STATUS.ACTIVE },
    select: { id: true, code: true },
  });
  CachingService.getInstance().set('ACTIVE-TOKENS', tokens, 300); // 5mins
  return tokens;
}
