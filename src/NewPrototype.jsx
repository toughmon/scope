import { useState, useMemo } from "react";

// 각 실행 주체는 두 가지 비트값을 가진다
//   slot_bit       = 자신의 고유 슬롯 (2^(order-1))
//   content_bitmask = 내가 실행될 때 보여줄 슬롯들의 OR 합
//                    → 이 안에 자신의 slot_bit 포함
//
// 예) 영상A (slot 0001, bitmask 0101)
//     → 0101 = 영상A(0001) | 퀴즈(0100)
//     → 영상A 실행 시: display = 0101, 영상A·퀴즈 노출, 영상B 숨김
const INIT_CONTENTS = [
  { id:1, title:"강의 영상 A", order:1, slot_bit:0b0001, content_bitmask:0b0101 },
  { id:2, title:"강의 영상 B", order:2, slot_bit:0b0010, content_bitmask:0b0110 },
  { id:3, title:"퀴즈 패널",   order:3, slot_bit:0b0100, content_bitmask:0b0100 },
];

const BITS = 4;
const COLORS = [
  { bg:"#EEF2FF", border:"#6366F1", text:"#3730A3", pill:"#6366F1", dim:"#C7D2FE" },
  { bg:"#FFF7ED", border:"#F97316", text:"#C2410C", pill:"#F97316", dim:"#FED7AA" },
  { bg:"#F0FDF4", border:"#22C55E", text:"#15803D", pill:"#22C55E", dim:"#BBF7D0" },
  { bg:"#FDF4FF", border:"#A855F7", text:"#7E22CE", pill:"#A855F7", dim:"#E9D5FF" },
];

function bin(n, w=BITS){ return (n|0).toString(2).padStart(w,"0"); }
function col(idx){ return COLORS[idx % COLORS.length]; }

export default function NewPrototype() {
  const [contents, setContents] = useState(INIT_CONTENTS);
  const [execId, setExecId] = useState(1); // 현재 실행 주체

  const execContent = useMemo(() => contents.find(c => c.id === execId), [contents, execId]);

  // 핵심 AND 연산: display_bitmask = execContent.content_bitmask
  const displayMask = execContent?.content_bitmask ?? 0;

  const results = useMemo(() => contents.map(c => ({
    ...c,
    andResult: displayMask & c.slot_bit,
    visible:   (displayMask & c.slot_bit) !== 0,
  })), [contents, displayMask]);

  function toggleMaskBit(id, bit) {
    setContents(prev => prev.map(c => c.id === id
      ? { ...c, content_bitmask: c.content_bitmask ^ bit }
      : c
    ));
  }

  return (
    <div style={{ fontFamily:"sans-serif", fontSize:13, color:"#111827", padding:"16px", minHeight:"100vh", background:"#fff" }}>

      {/* 개념 설명 */}
      <div style={{ marginBottom:20 }}>
        <h2 style={{ fontSize:17, fontWeight:600, margin:"0 0 10px" }}>LMS 콘텐츠 동시 노출 프로토타입 (New)</h2>
        <div style={{ background:"#F9FAFB", border:"1px solid #E5E7EB", borderRadius:10, padding:"12px 16px",
          fontFamily:"monospace", fontSize:11, lineHeight:2 }}>
          <div><span style={{ color:"#6366F1", fontWeight:700 }}>slot_bit</span>{"       "}<span style={{ color:"#6B7280" }}>= 콘텐츠 자신의 고유 슬롯 (2^(order-1))</span></div>
          <div><span style={{ color:"#6366F1", fontWeight:700 }}>content_bitmask</span><span style={{ color:"#6B7280" }}> = 내가 실행될 때 보여줄 슬롯들의 OR 합 (자신 포함)</span></div>
          <div><span style={{ color:"#6366F1", fontWeight:700 }}>노출 판별</span>{"     "}<span style={{ color:"#6B7280" }}> = execContent.content_bitmask </span><span style={{ color:"#F97316", fontWeight:700 }}>&</span><span style={{ color:"#6B7280" }}> target.slot_bit ≠ 0</span></div>
        </div>
      </div>

      {/* 콘텐츠 카드 — bitmask 편집 */}
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:11, fontWeight:700, color:"#6B7280", marginBottom:10,
          textTransform:"uppercase", letterSpacing:"0.06em" }}>
          콘텐츠 · content_bitmask 편집 (비트 클릭으로 토글)
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(220px,1fr))", gap:12 }}>
          {contents.map((c, i) => {
            const gc = col(i);
            const isExec = c.id === execId;
            return (
              <div key={c.id} style={{ border:`2px solid ${isExec ? gc.border : "#E5E7EB"}`,
                borderRadius:12, padding:"14px 16px",
                background: isExec ? gc.bg : "#FAFAFA",
                transition:"all .15s" }}>

                {/* 헤더 */}
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                  <span style={{ fontWeight:700, fontSize:13, color: isExec ? gc.text : "#374151" }}>{c.title}</span>
                  <span style={{ fontSize:9, fontWeight:700, background: isExec ? gc.pill : "#D1D5DB",
                    color:"#fff", borderRadius:99, padding:"2px 7px" }}>
                    {isExec ? "▶ 실행 중" : `order ${c.order}`}
                  </span>
                </div>

                {/* slot_bit */}
                <div style={{ marginBottom:10 }}>
                  <div style={{ fontSize:9, color:"#9CA3AF", marginBottom:3 }}>slot_bit (고유 슬롯)</div>
                  <div style={{ display:"flex", gap:3 }}>
                    {Array.from({length:BITS},(_,bi) => {
                      const on = !!(c.slot_bit & (1 << (BITS-1-bi)));
                      return (
                        <div key={bi} style={{ width:28, height:28, borderRadius:5, display:"flex",
                          alignItems:"center", justifyContent:"center",
                          fontFamily:"monospace", fontWeight:700, fontSize:13,
                          background: on ? gc.dim : "#F3F4F6",
                          color: on ? gc.text : "#D1D5DB",
                          border:`1px solid ${on ? gc.border : "#E5E7EB"}` }}>
                          {on ? "1" : "0"}
                        </div>
                      );
                    })}
                    <span style={{ fontFamily:"monospace", fontSize:11, color:"#9CA3AF", alignSelf:"center", marginLeft:4 }}>= {c.slot_bit}</span>
                  </div>
                </div>

                {/* content_bitmask — 클릭 편집 */}
                <div>
                  <div style={{ fontSize:9, color:"#9CA3AF", marginBottom:3 }}>
                    content_bitmask <span style={{ color:"#6366F1" }}>(클릭해서 편집)</span>
                  </div>
                  <div style={{ display:"flex", gap:3, alignItems:"center" }}>
                    {Array.from({length:BITS},(_,bi) => {
                      const bitVal = 1 << (BITS-1-bi);
                      const on = !!(c.content_bitmask & bitVal);
                      // 어떤 슬롯인지 표시
                      const who = contents.find(x => x.slot_bit === bitVal);
                      return (
                        <div key={bi} title={who ? `${who.title} 슬롯` : `bit${BITS-1-bi}`}
                          onClick={() => toggleMaskBit(c.id, bitVal)}
                          style={{ width:28, height:28, borderRadius:5, display:"flex",
                            alignItems:"center", justifyContent:"center",
                            fontFamily:"monospace", fontWeight:700, fontSize:13, cursor:"pointer",
                            background: on ? gc.pill : "#F3F4F6",
                            color: on ? "#fff" : "#D1D5DB",
                            border:`1.5px solid ${on ? gc.border : "#E5E7EB"}`,
                            transition:"all .1s" }}>
                          {on ? "1" : "0"}
                        </div>
                      );
                    })}
                    <span style={{ fontFamily:"monospace", fontSize:11, color: isExec ? gc.text : "#9CA3AF", fontWeight:700, marginLeft:4 }}>= {c.content_bitmask}</span>
                  </div>
                  {/* 어떤 슬롯이 켜져 있는지 */}
                  <div style={{ marginTop:5, display:"flex", gap:3, flexWrap:"wrap" }}>
                    {contents.filter(x => !!(c.content_bitmask & x.slot_bit)).map(x => (
                      <span key={x.id} style={{ fontSize:9, background: col(contents.indexOf(x)).bg,
                        color: col(contents.indexOf(x)).text, border:`1px solid ${col(contents.indexOf(x)).border}`,
                        borderRadius:4, padding:"1px 5px" }}>{x.title}</span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 실행 주체 선택 */}
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:11, fontWeight:700, color:"#6B7280", marginBottom:8,
          textTransform:"uppercase", letterSpacing:"0.06em" }}>실행 주체 선택</div>
        <div style={{ display:"flex", gap:8 }}>
          {contents.map((c, i) => {
            const gc = col(i);
            const active = c.id === execId;
            return (
              <button key={c.id} onClick={() => setExecId(c.id)} style={{
                padding:"10px 20px", borderRadius:10, cursor:"pointer", fontWeight:700, fontSize:13,
                border:`2px solid ${active ? gc.border : "#E5E7EB"}`,
                background: active ? gc.pill : "transparent",
                color: active ? "#fff" : "#6B7280",
                transition:"all .15s",
              }}>
                ▶ {c.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* AND 연산 시각화 */}
      {execContent && (
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:11, fontWeight:700, color:"#6B7280", marginBottom:10,
            textTransform:"uppercase", letterSpacing:"0.06em" }}>AND 연산</div>

          <div style={{ background:"#F9FAFB", border:"1px solid #E5E7EB", borderRadius:12, overflow:"hidden" }}>

            {/* display_bitmask 헤더 */}
            <div style={{ background:"#EEF2FF", borderBottom:"1px solid #C7D2FE", padding:"10px 16px",
              display:"flex", alignItems:"center", gap:12 }}>
              <span style={{ fontSize:11, color:"#3730A3", fontWeight:700 }}>display_bitmask</span>
              <span style={{ fontSize:11, color:"#6B7280" }}>=</span>
              <span style={{ fontSize:12, color:"#374151" }}>{execContent.title}.content_bitmask</span>
              <span style={{ fontSize:11, color:"#6B7280" }}>=</span>
              <span style={{ fontFamily:"monospace", fontSize:16, fontWeight:700, color:"#6366F1",
                background:"#fff", border:"1.5px solid #A5B4FC", borderRadius:7, padding:"3px 12px" }}>
                {bin(displayMask)}
              </span>
              <span style={{ fontFamily:"monospace", fontSize:12, color:"#9CA3AF" }}>({displayMask})</span>
            </div>

            {/* 각 콘텐츠 AND 결과 */}
            <div>
              {results.map((c, i) => {
                const gc = col(i);
                return (
                  <div key={c.id} style={{ display:"flex", alignItems:"center", gap:0,
                    borderBottom: i < results.length-1 ? "1px solid #F3F4F6" : "none",
                    background: c.visible ? gc.bg : "transparent" }}>

                    {/* 콘텐츠명 */}
                    <div style={{ width:120, padding:"12px 16px", fontWeight:700,
                      color: c.visible ? gc.text : "#9CA3AF", fontSize:12, flexShrink:0 }}>
                      {c.title}
                    </div>

                    {/* 수식 */}
                    <div style={{ flex:1, padding:"12px 8px", fontFamily:"monospace", fontSize:12,
                      display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                      <span style={{ color:"#6366F1", fontWeight:700 }}>{bin(displayMask)}</span>
                      <span style={{ color:"#F97316", fontWeight:700, fontSize:14 }}>&</span>
                      <span style={{ color: c.visible ? gc.text : "#9CA3AF" }}>{bin(c.slot_bit)}</span>
                      <span style={{ color:"#9CA3AF" }}>=</span>
                      <span style={{ fontWeight:700, color: c.visible ? gc.text : "#C0C4CC",
                        background: c.visible ? "#fff" : "transparent",
                        border: c.visible ? `1px solid ${gc.border}` : "1px solid transparent",
                        borderRadius:5, padding:"1px 8px" }}>
                        {bin(c.andResult)}
                      </span>
                      <span style={{ color:"#9CA3AF", fontSize:11 }}>({c.andResult})</span>
                    </div>

                    {/* 결과 */}
                    <div style={{ width:90, padding:"12px 16px", textAlign:"center", flexShrink:0 }}>
                      <span style={{ fontWeight:700, fontSize:11, padding:"3px 10px", borderRadius:99,
                        background: c.visible ? gc.pill : "#F3F4F6",
                        color: c.visible ? "#fff" : "#9CA3AF" }}>
                        {c.visible ? "▶ 노출" : "숨김"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 미리보기 */}
      <div>
        <div style={{ fontSize:11, fontWeight:700, color:"#6B7280", marginBottom:10,
          textTransform:"uppercase", letterSpacing:"0.06em" }}>
          노출 결과 — {execContent?.title} 실행 시
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
          {results.map((c, i) => {
            const gc = col(i);
            return (
              <div key={c.id} style={{ border:`1.5px solid ${c.visible ? gc.border : "#E5E7EB"}`,
                borderRadius:10, padding:"20px 16px", textAlign:"center",
                background: c.visible ? gc.bg : "#FAFAFA",
                opacity: c.visible ? 1 : 0.35, transition:"all .2s", minHeight:80,
                display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:6 }}>
                <span style={{ fontWeight:700, fontSize:14, color: c.visible ? gc.text : "#9CA3AF" }}>{c.title}</span>
                <span style={{ fontFamily:"monospace", fontSize:10, color: c.visible ? gc.border : "#D1D5DB" }}>
                  slot: {bin(c.slot_bit)}
                </span>
                {c.visible && (
                  <span style={{ fontSize:10, background: gc.pill, color:"#fff",
                    borderRadius:99, padding:"2px 8px", fontWeight:700 }}>노출</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
