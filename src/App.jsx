import React, { useState } from 'react';
import { 
  Play, 
  FileText, 
  HelpCircle, 
  Link as LinkIcon, 
  Type, 
  Rocket, 
  Cpu, 
  Layout, 
  MousePointer2,
  AlertCircle
} from 'lucide-react';
import './App.css';

const MOCK_CONTENTS = [
  { 
    id: 1, 
    title: '101-콘텐츠1', 
    type: 'VIDEO', 
    content_group_order: 0, 
    content_group_no: 101, 
    content_span_scope: 1, 
    icon: Play,
    desc: '강의 인트로 및 개요'
  },
  { 
    id: 2, 
    title: '101-콘텐츠2', 
    type: 'PDF', 
    content_group_order: 1, 
    content_group_no: 101, 
    content_span_scope: 10, 
    icon: FileText,
    desc: '핵심 요약 노트 문서'
  },
  { 
    id: 3, 
    title: '101-콘텐츠3', 
    type: 'QUIZ', 
    content_group_order: 2, 
    content_group_no: 101, 
    content_span_scope: 12, 
    icon: HelpCircle,
    desc: '섹션별 성취도 퀴즈'
  },
  { 
    id: 4, 
    title: '101-콘텐츠4', 
    type: 'LINK', 
    content_group_order: 3, 
    content_group_no: 101, 
    content_span_scope: 8, 
    icon: LinkIcon,
    desc: '심화 외부 자료 링크'
  },
  { 
    id: 5, 
    title: '101-콘텐츠5', 
    type: 'TEXT', 
    content_group_order: 4, 
    content_group_no: 101, 
    content_span_scope: 16, 
    icon: Type,
    desc: '개념 보충 안내 가이드'
  },
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
        <h1>LMS Smart View</h1>
        <p>Bitmask AND 연산을 활용한 지능형 콘텐츠 레이아웃 엔진 프로토타입</p>
      </header>

      <div className="info-section">
        <div className="info-card">
          <h3>메커니즘 검증</h3>
          <ul>
            <li>
              <strong>Scenario A (1&3)</strong>
              Scope: 10 (1010)
            </li>
            <li>
              <strong>Scenario B (2&3)</strong>
              Scope: 12 (1100)
            </li>
            <li>
              <strong>Logic Accuracy</strong>
              Bitwise AND 100%
            </li>
          </ul>
        </div>
      </div>

      <main className="app-main">
        {/* 제어 패널 (사이드바 - 실행만 담당) */}
        <aside className="panel-card sidebar-only">
          <h2><Rocket size={16} /> Smart Controller</h2>
          
          <div className="launch-list">
            {MOCK_CONTENTS.map((content) => (
              <div key={content.id} className="launch-item">
                <div className="launch-info">
                  <span className="launch-title">{content.title}</span>
                  <span className="scope-badge">scope_val: {content.content_span_scope}</span>
                </div>
                <button 
                  className="launch-btn"
                  onClick={() => applyPredefinedScope(content.content_span_scope)}
                  title="해당 scope 적용"
                >
                  <MousePointer2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </aside>

        {/* 메인 뷰어 (상단에 Bitmask State 위치) */}
        <section className="content-display">
          <div className="display-top-bar">
            <div className="bitmask-status-horizontal">
              <div className="status-label"><Cpu size={16} /> Bitmask State:</div>
              <div className="horizontal-val-group">
                <span className="h-val">{activeScope}</span>
                <span className="h-bin">({activeScope.toString(2).padStart(5, '0')})</span>
              </div>
              <div className="h-bit-toggles">
                {[0, 1, 2, 3, 4].map((order) => (
                  <button
                    key={order}
                    className={`h-bit-btn ${isVisible(order) ? 'active' : ''}`}
                    onClick={() => toggleBit(order)}
                  >
                    B{order}
                  </button>
                ))}
              </div>
              <div className="active-item-badge">
                Active Items: <strong>{visibleContents.length}</strong>
              </div>
            </div>
          </div>

          <div className="display-header-sub">
            <h3><Layout size={18} style={{verticalAlign: 'middle', marginRight: '8px'}} /> 학습 레이아웃</h3>
          </div>

          <div className={`content-grid visible-${visibleContents.length} compact-grid`}>
            {visibleContents.length > 0 ? (
              visibleContents.map((content) => {
                const Icon = content.icon;
                return (
                  <div key={content.id} className="content-card mini-card">
                    <div className="card-top">
                      <span className={`type-tag ${content.type}`}>{content.type}</span>
                      <div className="card-icon"><Icon size={18} /></div>
                    </div>
                    <h4>{content.title}</h4>
                    <div className="preview-area mini-preview">
                      <div className="preview-placeholder">
                        <p>{content.desc}</p>
                      </div>
                    </div>
                    <div className="card-footer">
                      <span>Order: {content.content_group_order}</span>
                      <span>Group: {content.content_group_no}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="empty-state">
                <AlertCircle size={48} className="empty-icon" />
                <p>활성화된 콘텐츠가 없습니다.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
