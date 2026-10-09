import React from 'react';
import {AbsoluteFill, Audio, Easing, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import '@fontsource/noto-sans-kr/400.css';
import '@fontsource/noto-sans-kr/700.css';
import '@fontsource/noto-sans-kr/900.css';
import edit from './edit.json';

const NAVY = '#1A2E5A';
const NAVY_DEEP = '#0F1D3D';
const CORAL = '#E8432B';
const CREAM = '#F7F3EC';
const SKY = '#8FB3E8';
const FONT = '"Noto Sans KR", sans-serif';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.bezier(0.22, 1, 0.36, 1);

// 프레임 f 에서 시작해 n 프레임 동안 0 -> 1
const prog = (frame: number, f: number, n = 12) => interpolate(frame, [f, f + n], [0, 1], {...clamp, easing: ease});

const Rise: React.FC<{at: number; children: React.ReactNode; dist?: number; style?: React.CSSProperties}> = ({at, children, dist = 60, style}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, at, 14);
  return <div style={{opacity: p, transform: `translateY(${(1 - p) * dist}px)`, ...style}}>{children}</div>;
};

const Pop: React.FC<{at: number; children: React.ReactNode; style?: React.CSSProperties}> = ({at, children, style}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - at, fps, config: {damping: 12, stiffness: 160}});
  return <div style={{transform: `scale(${s})`, opacity: Math.min(1, s * 2), ...style}}>{children}</div>;
};

const C: React.FC<{children: React.ReactNode}> = ({children}) => <span style={{color: CORAL}}>{children}</span>;

// 장면 공통 배경: 네이비 그라데이션 + 천천히 흐르는 격자
const Backdrop: React.FC<{light?: boolean}> = ({light}) => {
  const frame = useCurrentFrame();
  const shift = (frame * 0.6) % 120;
  const bg = light ? `linear-gradient(170deg, ${CREAM} 0%, #EDE6DA 100%)` : `linear-gradient(170deg, ${NAVY} 0%, ${NAVY_DEEP} 100%)`;
  const line = light ? 'rgba(26,46,90,0.06)' : 'rgba(255,255,255,0.05)';
  return (
    <AbsoluteFill style={{background: bg}}>
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${line} 2px, transparent 2px), linear-gradient(90deg, ${line} 2px, transparent 2px)`,
          backgroundSize: '120px 120px',
          backgroundPosition: `${shift}px ${shift}px`,
        }}
      />
    </AbsoluteFill>
  );
};

// 이유 번호 머리표 (01/05 ...)
const Tag: React.FC<{n: number; label: string; light?: boolean}> = ({n, label, light}) => (
  <Rise at={0} dist={30} style={{position: 'absolute', top: 260, left: 90, right: 90, display: 'flex', alignItems: 'center', gap: 24}}>
    <div style={{background: CORAL, color: 'white', fontFamily: FONT, fontWeight: 900, fontSize: 44, padding: '10px 26px', borderRadius: 14}}>
      이유 {String(n).padStart(2, '0')}
    </div>
    <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 40, color: light ? NAVY : SKY, letterSpacing: 2}}>{label}</div>
  </Rise>
);

const Title: React.FC<{children: React.ReactNode; light?: boolean; top?: number; size?: number}> = ({children, light, top = 400, size = 104}) => (
  <div style={{position: 'absolute', top, left: 90, right: 90, fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1.25, color: light ? NAVY : 'white', letterSpacing: -2}}>
    {children}
  </div>
);

const Body: React.FC<{children: React.ReactNode; light?: boolean; top: number}> = ({children, light, top}) => (
  <div style={{position: 'absolute', top, left: 90, right: 90, fontFamily: FONT, fontWeight: 700, fontSize: 52, lineHeight: 1.5, color: light ? NAVY : CREAM}}>{children}</div>
);

// ---------- 1. 훅 ----------
const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const q = spring({frame: frame - 48, fps: 30, config: {damping: 9, stiffness: 120}});
  return (
    <AbsoluteFill>
      <Backdrop />
      <Rise at={2} style={{position: 'absolute', top: 470, left: 90, right: 90, fontFamily: FONT, fontWeight: 700, fontSize: 64, color: SKY}}>
        런던 한복판에서
      </Rise>
      <Rise at={12} style={{position: 'absolute', top: 570, left: 90, right: 90, fontFamily: FONT, fontWeight: 900, fontSize: 120, color: 'white', lineHeight: 1.2, letterSpacing: -3}}>
        어학연수를
        <br />
        한다면
      </Rise>
      <Rise at={28} style={{position: 'absolute', top: 900, left: 90, right: 90, fontFamily: FONT, fontWeight: 900, fontSize: 120, color: CORAL, lineHeight: 1.2, letterSpacing: -3}}>
        왜 IH런던일까?
      </Rise>
      <div
        style={{
          position: 'absolute', top: 1180, right: 60, fontFamily: FONT, fontWeight: 900, fontSize: 520, color: 'rgba(232,67,43,0.18)',
          transform: `scale(${q}) rotate(${(1 - q) * -20}deg)`, lineHeight: 1,
        }}
      >
        ?
      </div>
      <Rise at={40} style={{position: 'absolute', top: 1260, left: 90, fontFamily: FONT, fontWeight: 700, fontSize: 46, color: CREAM}}>
        International House London
      </Rise>
    </AbsoluteFill>
  );
};

// ---------- 2. 전통·네트워크 ----------
const Counter: React.FC<{to: number; at: number; suffix: string; label: string; top: number}> = ({to, at, suffix, label, top}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, at, 30);
  const v = Math.round(to * p);
  return (
    <Rise at={at} style={{position: 'absolute', top, left: 90, right: 90, display: 'flex', alignItems: 'baseline', gap: 28, borderBottom: '3px solid rgba(255,255,255,0.15)', paddingBottom: 24}}>
      <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 150, color: 'white', letterSpacing: -4, minWidth: 400, fontVariantNumeric: 'tabular-nums'}}>
        {v}
        <span style={{fontSize: 80, color: CORAL}}>{suffix}</span>
      </div>
      <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 50, color: CREAM}}>{label}</div>
    </Rise>
  );
};

const History: React.FC = () => (
  <AbsoluteFill>
    <Backdrop />
    <Tag n={1} label="70년 전통 · 글로벌 네트워크" />
    <Title top={400} size={92}>
      <Rise at={4}>
        <C>1953년</C> 설립
      </Rise>
    </Title>
    <Counter to={70} at={16} suffix="년+" label="이어 온 영어 교육 전통" top={620} />
    <Counter to={45} at={30} suffix="개국+" label="전 세계 진출 국가" top={880} />
    <Counter to={130} at={44} suffix="개+" label="IH 네트워크 학교" top={1140} />
    <Rise at={70} style={{position: 'absolute', top: 1450, left: 90, right: 90, fontFamily: FONT, fontWeight: 700, fontSize: 50, color: CREAM, lineHeight: 1.5}}>
      그중 대표 학교가 바로 <C>IH런던</C>
    </Rise>
  </AbsoluteFill>
);

// ---------- 3. CELTA ----------
const Celta: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const stamp = spring({frame: frame - 20, fps, config: {damping: 10, stiffness: 200}});
  return (
    <AbsoluteFill>
      <Backdrop light />
      <Tag n={2} label="선생님을 가르치는 학교" light />
      <Title light top={400} size={96}>
        <Rise at={4}>영어 교사 자격증</Rise>
        <Rise at={10}>
          <C>CELTA</C>를
        </Rise>
        <Rise at={16}>처음 시작한 곳</Rise>
      </Title>
      <div
        style={{
          position: 'absolute', top: 860, left: 540 - 240, width: 480, height: 480, borderRadius: '50%', border: `14px solid ${CORAL}`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          transform: `scale(${2.2 - 1.2 * stamp}) rotate(-12deg)`, opacity: Math.min(1, stamp * 1.5), color: CORAL, fontFamily: FONT,
        }}
      >
        <div style={{fontWeight: 900, fontSize: 130, letterSpacing: 4}}>CELTA</div>
        <div style={{fontWeight: 700, fontSize: 46}}>원조 교육기관</div>
      </div>
      <Body light top={1430}>
        <Rise at={50}>
          강사진 대부분이 상급 자격
          <br />
          <C>DELTA</C>까지 보유
        </Rise>
      </Body>
    </AbsoluteFill>
  );
};

// ---------- 4. 위치 ----------
const places = [
  {name: '홀본역', x: 250, y: 1000, at: 26},
  {name: '코벤트가든역', x: 820, y: 1120, at: 34},
  {name: '대영박물관', x: 280, y: 1330, at: 44},
  {name: '소호 · 웨스트엔드', x: 790, y: 1440, at: 52},
];
const Location: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const cx = 540;
  const cy = 1220;
  const pin = spring({frame: frame - 12, fps, config: {damping: 10}});
  const pulse = (frame % 30) / 30;
  return (
    <AbsoluteFill>
      <Backdrop />
      <Tag n={3} label="런던 센트럴 입지" />
      <Title top={400} size={92}>
        <Rise at={4}>
          주요 명소가 모두
          <br />
          <C>걸어서</C> 닿는 거리
        </Rise>
      </Title>
      <svg width={1080} height={1920} style={{position: 'absolute', top: 0, left: 0}}>
        {/* 템스강 느낌의 곡선 */}
        <path d="M -20 1640 C 300 1560, 600 1720, 1100 1600" stroke="rgba(143,179,232,0.35)" strokeWidth={46} fill="none" />
        {places.map((p) => {
          const k = prog(frame, p.at, 14);
          return (
            <g key={p.name}>
              <line x1={cx} y1={cy} x2={cx + (p.x - cx) * k} y2={cy + (p.y - cy) * k} stroke={CORAL} strokeWidth={6} strokeDasharray="18 14" />
              <circle cx={p.x} cy={p.y} r={22 * k} fill="white" />
            </g>
          );
        })}
        <circle cx={cx} cy={cy} r={40 + pulse * 70} fill="none" stroke={CORAL} strokeWidth={5} opacity={(1 - pulse) * pin} />
        <circle cx={cx} cy={cy} r={42 * pin} fill={CORAL} />
      </svg>
      <div style={{position: 'absolute', left: cx - 120, top: cy - 140, width: 240, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 48, color: 'white', opacity: pin}}>
        IH런던
      </div>
      {places.map((p) => (
        <div
          key={p.name}
          style={{
            position: 'absolute', left: p.x - 230, top: p.y + 34, width: 460, textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 44,
            color: CREAM, opacity: prog(frame, p.at + 8, 10),
          }}
        >
          {p.name}
        </div>
      ))}
      <Rise at={70} style={{position: 'absolute', top: 1730, left: 90, right: 90, fontFamily: FONT, fontWeight: 700, fontSize: 46, color: CREAM, textAlign: 'center'}}>
        수업 끝나면 뮤지컬 · 카페 · 쇼핑까지
      </Rise>
    </AbsoluteFill>
  );
};

// ---------- 5. 9층 건물 ----------
const floors = ['교육 자료 센터', '리셉션 · 카페', '도서관 · 사무실', '시험 사무실', '그룹 강의실', '그룹 강의실', '그룹 강의실', '1:1 · 소그룹 강의실', '이그제큐티브 센터'];
const floorColors = ['#2E6B5E', '#4F8A4B', '#C9A227', '#E07B39', CORAL, '#C2417A', '#7A3D8C', '#3E4FA3', '#2C7FB8'];
const Building: React.FC = () => {
  const frame = useCurrentFrame();
  const H = 96;
  const base = 1700;
  return (
    <AbsoluteFill>
      <Backdrop light />
      <Tag n={4} label="건물 전체가 어학원" light />
      <Title light top={400} size={92}>
        <Rise at={4}>
          지하부터 꼭대기까지
          <br />
          <C>9개 층</C> 전부 사용
        </Rise>
      </Title>
      {floors.map((name, i) => {
        const at = 14 + i * 7;
        const k = prog(frame, at, 12);
        return (
          <div
            key={i}
            style={{
              position: 'absolute', left: 140, right: 140, top: base - (i + 1) * (H + 8), height: H, borderRadius: 14, background: floorColors[i],
              display: 'flex', alignItems: 'center', paddingLeft: 36, gap: 30, fontFamily: FONT, color: 'white',
              opacity: k, transform: `translateY(${(1 - k) * -160}px)`,
            }}
          >
            <div style={{fontWeight: 900, fontSize: 40, width: 70}}>{i === 0 ? 'B' : i === 1 ? 'G' : i === 2 ? 'UG' : i === 3 ? 'M' : i - 3}</div>
            <div style={{fontWeight: 700, fontSize: 40}}>{name}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ---------- 6. 공식 시험센터 ----------
const Check: React.FC<{at: number; text: string; top: number}> = ({at, text, top}) => {
  const frame = useCurrentFrame();
  const k = prog(frame, at, 10);
  return (
    <div style={{position: 'absolute', top, left: 90, right: 90, display: 'flex', alignItems: 'center', gap: 34, opacity: Math.min(1, k * 2)}}>
      <svg width={96} height={96}>
        <circle cx={48} cy={48} r={44} fill={CORAL} />
        <path d="M 26 50 L 42 66 L 72 32" stroke="white" strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={80} strokeDashoffset={80 * (1 - k)} />
      </svg>
      <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 56, color: 'white'}}>{text}</div>
    </div>
  );
};
const Exam: React.FC = () => (
  <AbsoluteFill>
    <Backdrop />
    <Tag n={5} label="공식 시험센터" />
    <Title top={400} size={96}>
      <Rise at={4}>
        <C>IELTS</C> · <C>Cambridge</C>
      </Rise>
      <Rise at={10}>공식 시험센터</Rise>
    </Title>
    <Body top={720}>
      <Rise at={20}>매일 공부하던 익숙한 교실에서
        <br />실제 시험을 볼 수 있어요</Rise>
    </Body>
    <Check at={46} text="대학·대학원 진학 준비생" top={1080} />
    <Check at={58} text="취업용 점수가 필요한 분" top={1230} />
    <Check at={70} text="시험 당일 긴장 DOWN" top={1380} />
  </AbsoluteFill>
);

// ---------- 7. 과정 ----------
const courses = [
  {t: '일반영어', s: 'General English'},
  {t: '아카데믹 IELTS', s: '시험 준비반'},
  {t: '비즈니스 영어', s: '전문직 · 성인 과정'},
  {t: '소셜 프로그램', s: '액티비티 · 언어교환'},
];
const Courses: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Backdrop light />
      <Title light top={300} size={92}>
        <Rise at={2}>
          목적에 맞게
          <br />
          <C>골라 듣는</C> 과정
        </Rise>
      </Title>
      {courses.map((c, i) => {
        const at = 10 + i * 8;
        const k = prog(frame, at, 12);
        return (
          <div
            key={c.t}
            style={{
              position: 'absolute', left: 90, right: 90, top: 680 + i * 250, height: 210, borderRadius: 28, background: i === 3 ? CORAL : NAVY,
              display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingLeft: 60, fontFamily: FONT,
              opacity: k, transform: `translateX(${(1 - k) * 700}px)`,
            }}
          >
            <div style={{fontWeight: 900, fontSize: 66, color: 'white'}}>{c.t}</div>
            <div style={{fontWeight: 400, fontSize: 40, color: i === 3 ? 'white' : SKY}}>{c.s}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ---------- 8. 엔드카드 ----------
const End: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const hit = spring({frame, fps, config: {damping: 11, stiffness: 140}});
  const flash = interpolate(frame, [0, 8], [0.55, 0], clamp);
  return (
    <AbsoluteFill>
      <Backdrop />
      <div style={{position: 'absolute', top: 520, left: 90, right: 90, fontFamily: FONT, transform: `scale(${0.85 + 0.15 * hit})`, opacity: hit}}>
        <div style={{fontWeight: 700, fontSize: 60, color: SKY}}>제대로 배우는 런던 어학연수</div>
        <div style={{fontWeight: 900, fontSize: 150, color: 'white', letterSpacing: -4, lineHeight: 1.15, marginTop: 20}}>
          IH런던
        </div>
      </div>
      <Rise at={14} style={{position: 'absolute', top: 980, left: 90, right: 90}}>
        <div style={{height: 6, width: 160, background: CORAL, marginBottom: 50}} />
        <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 72, color: 'white', lineHeight: 1.35}}>영국유학센터 신촌지사</div>
        <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 56, color: CREAM, marginTop: 16}}>영국 어학연수 · 유학 전문 상담</div>
      </Rise>
      <Pop at={34} style={{position: 'absolute', top: 1380, left: 90, right: 90}}>
        <div style={{background: CORAL, borderRadius: 999, padding: '38px 0', textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 64, color: 'white'}}>
          무료 상담 신청하기
        </div>
      </Pop>
      <AbsoluteFill style={{background: 'white', opacity: flash}} />
    </AbsoluteFill>
  );
};

const scenes: Record<string, React.FC> = {hook: Hook, history: History, celta: Celta, location: Location, building: Building, exam: Exam, courses: Courses, end: End};

// 상단 진행 막대
const Progress: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  return <div style={{position: 'absolute', top: 0, left: 0, height: 12, width: `${(frame / (durationInFrames - 1)) * 100}%`, background: CORAL}} />;
};

export const Promo: React.FC = () => {
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{background: NAVY}}>
      {edit.cuts.map((c) => {
        // 시작 프레임은 누적 시간에서 한 번만 반올림 (G12)
        const from = Math.round(c.t * fps);
        const to = Math.round((c.t + c.d) * fps);
        const id = c.src.replace(/^mg:/, '').replace(/@.*$/, '');
        const Scene = scenes[id];
        return (
          <Sequence key={c.src} from={from} durationInFrames={to - from}>
            <Scene />
          </Sequence>
        );
      })}
      <Progress />
      <Audio src={staticFile('music.wav')} />
    </AbsoluteFill>
  );
};
