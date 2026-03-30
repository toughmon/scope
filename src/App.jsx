import React, { useState } from 'react';
import './App.css';

const MOCK_CONTENTS = [
  { id: 1, title: '콘텐츠 0 (기본)', type: 'video', content_group_order: 0, content_group_no: 101, content_span_scope: 1 },
  { id: 2, title: '콘텐츠 1 (1&3 페어)', type: 'pdf', content_group_order: 1, content_group_no: 101, content_span_scope: 10 }, // 1(2^1=2) + 3(2^3=8) = 10
  { id: 3, title: '콘텐츠 2 (2&3 페어)', type: 'quiz', content_group_order: 2, content_group_no: 101, content_span_scope: 12 }, // 2(2^2=4) + 3(2^3=8) = 12
  { id: 4, title: '콘텐츠 3 (공통 페어)', type: 'link', content_group_order: 3, content_group_no: 101, content_span_scope: 8 },
  { id: 5, title: '콘텐츠 4 (독립)', type: 'text', content_group_order: 4, content_group_no: 101, content_span_scope: 16 },
];

function App() {
  const [activeScope, setActiveScope] = useState(1);

  const toggleBit = (order) => {
    setActiveScope(prev => prev ^ (1 << order));
  };

  const isVisible = (order) => {
    return (activeScope & (1 << order)) !== 0;
  };

  const applyPredefinedScope = (scope) => {
    setActiveScope(scope);
  };

  const visibleContents = MOCK_CONTENTS.filter(content => isVisible(content.content_group_order));

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>LMS 콘텐츠 동시 노출 프로토타입 v2</h1>
        <p>개별 콘텐츠별 defined <code>content_span_scope</code> 검증</p>
      </header>

      <main className="app-main">
        {/* 설명 섹션 */}
        <section className="info-section">
          <div className="info-card">
            <h3>사용자 피드백 반영 사항</h3>
            <ul>
              <li><strong>시나리오 A (1 & 3 동시 노출)</strong>: <code>content_span_scope</code> = <strong>10</strong> (binary: 1010)</li>
              <li><strong>시나리오 B (2 & 3 동시 노출)</strong>: <code>content_span_scope</code> = <strong>12</strong> (binary: 1100)</li>
              <li>두 시나리오가 서로 다른 scope 값을 가짐으로써 중복 없이 동시 노출 그룹을 제어할 수 있음을 증명합니다.</li>
            </ul>
          </div>
        </section>

        {/* 제어 패널 */}
        <section className="control-panel">
          <div className="panel-grid">
            {/* 개별 콘텐츠 실행 테스트 */}
            <div className="panel-card">
              <h2>강의 실행 (콘텐츠별 Scope 로드)</h2>
              <div className="launch-list">
                {MOCK_CONTENTS.map((content) => (
                  <div key={content.id} className="launch-item">
                    <div className="launch-info">
                      <span className="order-badge">{content.content_group_order}</span>
                      <span className="launch-title">{content.title}</span>
                      <code className="scope-code">scope: {content.content_span_scope}</code>
                    </div>
                    <button 
                      className="launch-btn"
                      onClick={() => applyPredefinedScope(content.content_span_scope)}
                    >
                      실행
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 현재 상태 및 수동 제어 */}
            <div className="panel-card">
              <h2>현재 활성 Bitmask (activeScope)</h2>
              <div className="value-display highlight">
                <span className="label">Current Active Scope:</span>
                <span className="value">{activeScope}</span>
                <span className="binary">(binary: {activeScope.toString(2).padStart(5, '0')})</span>
              </div>
              <div className="bit-toggles small">
                {[0, 1, 2, 3, 4].map((order) => (
                  <button
                    key={order}
                    className={`bit-btn-small ${isVisible(order) ? 'active' : ''}`}
                    onClick={() => toggleBit(order)}
                  >
                    Bit {order}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 콘텐츠 노출 영역 */}
        <section className="content-display">
          <div className="display-header">
            <h3>학습 레이아웃 (노출 개수: {visibleContents.length})</h3>
          </div>
          <div className={`content-grid visible-${visibleContents.length}`}>
            {visibleContents.length > 0 ? (
              visibleContents.map((content) => (
                <div key={content.id} className={`content-card type-${content.type} ${isVisible(content.content_group_order) ? 'visible' : ''}`}>
                  <div className="content-tag">{content.type.toUpperCase()}</div>
                  <h4>{content.title}</h4>
                  <div className="content-placeholder">
                    {content.type === 'video' && <div className="video-icon">▶</div>}
                    {content.type === 'pdf' && <div className="pdf-icon">📄</div>}
                    {content.type === 'quiz' && <div className="quiz-icon">❓</div>}
                    {content.type === 'link' && <div className="quiz-icon">🔗</div>}
                    <p>{content.title} 본문</p>
                  </div>
                  <div className="content-footer">
                    Order: {content.content_group_order} | Group: {content.content_group_no}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                활성화된 콘텐츠가 없습니다. 좌측 상단 '실행' 버튼을 눌러보세요.
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
