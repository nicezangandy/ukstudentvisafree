// Code.gs의 순수 로직을 Node에서 검사합니다:  node purchase-tracker/test/core.test.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const ctx = {};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname, '../apps-script/Code.gs'), 'utf8'), ctx);
const g = (name) => ctx[name];

const rows = [
  { id: '1', date: '2025-03-02', item: 'Logitech M650 무선 마우스 그래파이트', brand: '로지텍', model: 'M650', mall: '쿠팡', price: 39900, memo: '' },
  { id: '2', date: '2025-06-10', item: '앤커 USB-C 충전기 65W', brand: 'Anker', model: '', mall: '네이버 스마트스토어(앤커코리아)', price: 45000, memo: '' },
  { id: '3', date: '2025-03-03', item: '', brand: '', model: '', mall: 'KG이니시스', price: 39900, memo: '' },
  { id: '4', date: '2025-07-01', item: '', brand: '', model: '', mall: '토스페이먼츠', price: 12000, memo: '' },
  { id: '5', date: '2024-11-20', item: '로지텍 MX Keys 키보드', brand: '로지텍', model: 'MX Keys', mall: '11번가', price: 129000, memo: '' },
];

const search = (q) => g('searchPurchases')(rows, q).map((r) => r.id);

// 한글 브랜드로 영문 상품명 찾기, 띄어쓰기/대소문자 무시, 최신순
assert.deepStrictEqual(search('로지텍 m650'), ['1']);
assert.deepStrictEqual(search('logitech'), ['1', '5']);
assert.deepStrictEqual(search('로지텍'), ['1', '5']);
assert.deepStrictEqual(search('m 650'), ['1']); // 띄어 쓴 모델명도 찾음
assert.deepStrictEqual(search('mx keys'), ['5']);
assert.deepStrictEqual(search('충전기'), ['2']);
assert.deepStrictEqual(search('charger'), ['2']);
assert.deepStrictEqual(search('').length, 5);
assert.deepStrictEqual(search('없는상품'), []);

// 발신 도메인 → 쇼핑몰
assert.strictEqual(g('detectMall')('쿠팡 <no-reply@coupang.com>'), '쿠팡');
assert.strictEqual(g('detectMall')('"네이버페이" <naverpay_noreply@navercorp.com>'), '네이버');
assert.strictEqual(g('detectMall')('someone@unknown-shop.kr'), '');

// 결제대행사 판별
assert.ok(g('isPg')('KG이니시스'));
assert.ok(g('isPg')('(주)케이지이니시스 KG INICIS'));
assert.ok(g('isPg')('NHN KCP'));
assert.ok(!g('isPg')('쿠팡'));
assert.ok(!g('isPg')(''));

// 결제대행사 결제 ↔ 같은 금액·근접 날짜의 주문 매칭
const review = g('findUnresolvedPayments')(rows, 3);
const byId = Object.fromEntries(review.map((x) => [x.payment.id, x.candidates.map((c) => c.id)]));
assert.deepStrictEqual(byId['3'], ['1']);
assert.deepStrictEqual(byId['4'], []);

// 합치기: 주문 정보 유지 + PG 기록
const merged = g('mergePurchase')(rows[0], { ...rows[2], payment: '신한카드' });
assert.strictEqual(merged.item, rows[0].item);
assert.strictEqual(merged.pg, 'KG이니시스');
assert.strictEqual(merged.payment, '신한카드');
assert.ok(merged.memo.includes('카드내역 합침'));

// 금액 추출 & AI 없는 대략 추출
assert.strictEqual(g('extractMaxAmount')('상품금액 41,900원 할인 -2,000원 결제금액 39,900원 / 배송비 0원'), 41900);
assert.strictEqual(g('extractMaxAmount')('Total ₩129,000'), 129000);
const h = g('heuristicFromText')('본문 결제금액 39,900원', '[쿠팡] 주문하신 상품의 결제가 완료되었습니다', 'x@coupang.com');
assert.strictEqual(h.mall, '쿠팡');
assert.strictEqual(h.price, 39900);
assert.ok(!h.item.startsWith('['));

assert.ok(g('isLikelyOrderSubject')('주문이 완료되었습니다'));
assert.ok(!g('isLikelyOrderSubject')('[광고] 주문 시 쿠폰 혜택'));

assert.ok(g('stripHtml')('<style>x{}</style><p>상품&nbsp;A</p><div>1,000원</div>').includes('상품 A'));

// Claude 응답 파싱
const parsed = g('parseClaudeResponse')({
  stop_reason: 'end_turn',
  content: [{ type: 'thinking', thinking: '' }, { type: 'text', text: JSON.stringify({ purchases: [{ item: 'M650', qty: 0 }] }) }],
});
assert.strictEqual(parsed[0].item, 'M650');
assert.strictEqual(parsed[0].qty, 1);
assert.throws(() => g('parseClaudeResponse')({ stop_reason: 'refusal', content: [] }));

console.log('모든 테스트 통과');
