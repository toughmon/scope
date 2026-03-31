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
  { id:1, title:"강의 영상 A", order:1, slot_bit:0b0001, content_bitmask:0b1101, type: "video", url: "https://www.w3schools.com/html/mov_bbb.mp4", desc: "HTML5 빅벅버니 비디오 샘플입니다. 실제 영상 재생을 테스트해볼 수 있습니다." },
  { id:2, title:"강의 영상 B", order:2, slot_bit:0b0010, content_bitmask:0b1010, type: "video", url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm", desc: "대체 비디오 소스입니다. 다른 내용을 시연할 때 사용됩니다." },
  { id:3, title:"퀴즈 패널",   order:3, slot_bit:0b0100, content_bitmask:0b0100, type: "quiz", desc: "학습 내용을 점검하는 퀴즈 섹션입니다." },
  { id:4, title:"학습 자료",   order:4, slot_bit:0b1000, content_bitmask:0b1000, type: "doc", desc: "강의 교안 및 보충 자료 다운로드 링크와 텍스트가 표시됩니다." },
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
  const [showPopup, setShowPopup] = useState(false);

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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 8 }}>
          <div style={{ fontSize:11, fontWeight:700, color:"#6B7280", textTransform:"uppercase", letterSpacing:"0.06em" }}>실행 주체 선택</div>
          <button 
            onClick={() => setShowPopup(true)}
            style={{
              padding: "8px 16px", background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)", color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 6px -1px rgba(79, 70, 229, 0.3)",
              transition: "transform 0.1s"
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.02)"}
            onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            🚀 {contents.find(c => c.id === execId)?.title} 콘텐츠 실행
          </button>
        </div>
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

      {/* 팝업 모달 */}
      {showPopup && execContent && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(17, 24, 39, 0.7)", backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999,
          padding: 20
        }}>
          <div style={{
            background: "#fff", width: "100%", maxWidth: 1200, height: "85vh", borderRadius: 24,
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)", overflow: "hidden", display: "flex", flexDirection: "column"
          }}>
            {/* Header */}
            <div style={{ padding: "16px 24px", borderBottom: "1px solid #E5E7EB", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fdfdfd" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>{execContent.title}</span>
                <span style={{ fontSize: 12, background: "#EEF2FF", color: "#4F46E5", padding: "4px 8px", borderRadius: 8, fontWeight: 700 }}>실행 중인 콘텐츠</span>
              </div>
              <button 
                onClick={() => setShowPopup(false)}
                style={{ background: "#F3F4F6", border: "none", width: 32, height: 32, borderRadius: 16, cursor: "pointer", fontSize: 16, color: "#4B5563", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s" }}
                onMouseOver={(e) => e.currentTarget.style.background = "#E5E7EB"}
                onMouseOut={(e) => e.currentTarget.style.background = "#F3F4F6"}
              >
                ✕
              </button>
            </div>
            {/* Body */}
            <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
              {/* Main Content Area */}
              <div style={{ flex: 3, background: "#000", display: "flex", flexDirection: "column", position: "relative" }}>
                 {execContent.type === 'video' ? (
                   <video controls autoPlay src={execContent.url} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                 ) : (
                   <div style={{ color: "#fff", textAlign: "center", padding: 40, margin: "auto" }}>
                     <div style={{ fontSize: 64, marginBottom: 20 }}>{execContent.type === 'quiz' ? '📝' : '📄'}</div>
                     <h3 style={{ fontSize: 28, margin: "0 0 12px 0", fontWeight: 700 }}>{execContent.title}</h3>
                     <p style={{ color: "#9CA3AF", fontSize: 16 }}>{execContent.desc}</p>
                   </div>
                 )}
              </div>
              
              {/* Scope 관련 콘텐츠 (Side Panel) */}
              <div style={{ width: 400, background: "#F9FAFB", borderLeft: "1px solid #E5E7EB", overflowY: "auto", display: "flex", flexDirection: "column" }}>
                <div style={{ padding: "20px 24px", borderBottom: "1px solid #E5E7EB", background: "#fff", position: "sticky", top: 0, zIndex: 10 }}>
                  <h4 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#111827", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: "#4F46E5" }}>⚡</span> 함께 노출된 콘텐츠
                  </h4>
                  <div style={{ fontSize: 12, color: "#6B7280", marginTop: 4 }}>현재 Bitmask 설정에 의해 표시됩니다</div>
                </div>
                
                <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                  {results.filter(c => c.visible && c.id !== execContent.id).length === 0 ? (
                    <div style={{ fontSize: 14, color: "#9CA3AF", textAlign: "center", padding: "40px 0", background: "#F3F4F6", borderRadius: 12 }}>같이 노출될 콘텐츠가 없습니다.</div>
                  ) : (
                    results.filter(c => c.visible && c.id !== execContent.id).map(c => (
                      <div key={c.id} style={{
                        background: "#fff", border: "1px solid #E5E7EB", borderRadius: 16, padding: 18,
                        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", transition: "transform 0.2s, box-shadow 0.2s",
                        cursor: "pointer"
                      }}
                      onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0,0,0,0.1)"; }}
                      onMouseOut={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0,0,0,0.05)"; }}
                      >
                         <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                           <div style={{ width: 32, height: 32, borderRadius: 8, background: c.type === 'video' ? '#FEE2E2' : c.type === 'quiz' ? '#E0E7FF' : '#FEF3C7', display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                             {c.type === 'video' ? '▶️' : c.type === 'quiz' ? '📝' : '📄'}
                           </div>
                           <span style={{ fontWeight: 700, fontSize: 15, color: "#111827" }}>{c.title}</span>
                         </div>
                         <p style={{ margin: 0, fontSize: 13, color: "#6B7280", lineHeight: 1.5 }}>{c.desc}</p>
                         
                         {c.type === 'video' && (
                           <div style={{ marginTop: 16, background: "#000", borderRadius: 10, overflow: "hidden", aspectRatio: "16/9", position: "relative" }}>
                             <video src={c.url} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.6 }} />
                             <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 40, height: 40, background: "rgba(255,255,255,0.9)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#4F46E5", fontSize: 16, paddingLeft: 3 }}>▶</div>
                           </div>
                         )}
                         {c.type === 'quiz' && (
                           <div style={{ marginTop: 16 }}>
                             <button style={{ width: "100%", background: "#4F46E5", color: "#fff", border: "none", padding: "10px", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 13, display: "flex", justifyContent: "center", gap: 6 }}>
                               <span>풀기 시작</span> <span>→</span>
                             </button>
                           </div>
                         )}
                         {c.type === 'doc' && (
                           <div style={{ marginTop: 16 }}>
                             <button style={{ width: "100%", background: "#F3F4F6", color: "#374151", border: "1px solid #D1D5DB", padding: "10px", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 13, display: "flex", justifyContent: "center", gap: 6, transition: "background 0.2s" }}
                             onMouseOver={(e) => e.currentTarget.style.background = "#E5E7EB"}
                             onMouseOut={(e) => e.currentTarget.style.background = "#F3F4F6"}>
                               <span>자료 다운로드</span> <span>↓</span>
                             </button>
                           </div>
                         )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
