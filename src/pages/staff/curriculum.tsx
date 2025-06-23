/**
 * Timeline/stepper: all nodes perfectly aligned on a single vertical line.
 * The vertical line runs from the top node to the bottom node, with each node centered on the line.
 * Semester content is offset to the right.
 */
import React, { useState } from 'react';
import { Input, Button, Collapse, Typography, Affix } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import styles from '../../css/staff/staffTranscript.module.css';
import { curriculums, subjects, combos, curriculumSubjects, comboSubjects } from '../../data/schoolData';
import { useSearchParams, useNavigate } from 'react-router';

const { Panel } = Collapse;
const { Title } = Typography;

const nodeColor = 'rgba(30,64,175,1)';
const nodeBorder = '2.5px solid #fff';
const nodeSize = 18;
const lineWidth = 4;
const lineColor = 'rgba(30,64,175,0.18)';

const CurriculumPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  React.useEffect(() => {
    const title = searchParams.get('title');
    if (title) setSearch(title);
  }, [searchParams]);
  const filteredCurriculums = curriculums.filter(
    c => c.curriculumName.toLowerCase().includes(search.toLowerCase()) || c.id.toString().includes(search)
  );

  return (
    <div className={styles.sttContainer} style={{paddingTop: '120px'}}>
      {/* Sticky Toolbar */}
      <Affix offsetTop={80} style={{zIndex: 10}}>
        <div style={{background: 'rgba(255,255,255,0.55)', borderRadius: 20, boxShadow: '0 4px 18px rgba(30,64,175,0.13)', border: '1.5px solid rgba(255,255,255,0.18)', padding: 24, marginBottom: 32, display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center'}}>
          <Input
            placeholder="Search by Curriculum ID or Name"
            prefix={<SearchOutlined />}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{maxWidth: 240, borderRadius: 999}}
            size="large"
          />
          <Button type="primary" icon={<PlusOutlined />} size="large" style={{borderRadius: 999}}>
            Add Curriculum
          </Button>
          {/* TODO: Implement Add Curriculum modal/dialog */}
        </div>
      </Affix>
      {/* Curriculum Cards */}
      <Collapse accordion bordered={false} className={styles.sttFreshTable} style={{background: 'rgba(255,255,255,0.45)', borderRadius: 20, boxShadow: '0 10px 40px rgba(30,64,175,0.13)'}}>
        {filteredCurriculums.map(curriculum => (
          <Panel
            header={<span style={{fontWeight: 700, fontSize: '1.2rem', color: '#1E40AF'}}>{curriculum.curriculumName} <span style={{color: '#f97316', fontWeight: 400, marginLeft: 8}}>[{curriculum.curriculumCode}]</span></span>}
            key={curriculum.id}
            style={{background: 'rgba(255,255,255,0.85)', borderRadius: 16, marginBottom: 12, color: '#1E40AF', boxShadow: '0 2px 12px rgba(30,64,175,0.13)'}}
          >
            {/* Timeline for 9 Semesters */}
            <div style={{display: 'grid', gridTemplateColumns: `${nodeSize + lineWidth + 18}px 1fr`, gap: 0, position: 'relative', marginLeft: 8}}>
              {/* Vertical line: absolute, centered behind all nodes */}
              <div style={{position: 'absolute', left: (nodeSize + lineWidth + 18) / 2 - lineWidth / 2, top: 0, width: lineWidth, height: '100%', background: lineColor, zIndex: 0, borderRadius: 2}} />
              {/* Timeline and semester content rows */}
              {[...Array(9)].map((_, semIdx) => {
                const semesterNumber = semIdx + 1;
                // Subjects for this semester
                const semesterSubjects = curriculumSubjects.filter(cs => cs.curriculumId === curriculum.id && cs.semesterNumber === semesterNumber && cs.isMandetory);
                // Combos for this semester
                const semesterCombos = curriculumSubjects.filter(cs => cs.curriculumId === curriculum.id && cs.semesterNumber === semesterNumber && !cs.isMandetory);
                return (
                  <React.Fragment key={semesterNumber}>
                    {/* Timeline node: perfectly centered with semester card */}
                    <div style={{position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%'}}>
                      <div style={{width: nodeSize, height: nodeSize, borderRadius: '50%', background: nodeColor, border: nodeBorder, boxShadow: '0 2px 8px #1E40AF33', zIndex: 2}} />
                    </div>
                    {/* Semester content */}
                    <div style={{marginBottom: 12, background: 'rgba(255,255,255,0.13)', borderRadius: 12, padding: 16, boxShadow: '0 1px 6px rgba(30,64,175,0.07)', minHeight: 64}}>
                      <Title level={5} style={{color: '#1E40AF', marginBottom: 8}}>Semester {semesterNumber}</Title>
                      {/* Normal Subjects */}
                      <div style={{marginBottom: 8}}>
                        <b style={{color: '#1E90FF'}}>Subjects:</b>
                        <ul style={{margin: 0, paddingLeft: 20}}>
                          {semesterSubjects.map(cs => {
                            const subj = subjects.find(s => s.id === cs.subjectId);
                            return subj ? (
                              <li
                                key={subj.id}
                                style={{color: '#1E40AF', cursor: 'pointer', textDecoration: 'underline'}}
                                onClick={() => navigate(`/staff/subjects?title=${encodeURIComponent(subj.subjectName)}`)}
                              >
                                {subj.subjectName} ({subj.subjectCode})
                              </li>
                            ) : null;
                          })}
                        </ul>
                      </div>
                      {/* Combos (from semester 5+) */}
                      {semesterNumber >= 5 && (
                        <div>
                          {semesterCombos.map(cs => {
                            const combo = combos.find(cb => cb.id === cs.subjectId); // subjectId is comboId for combos
                            if (!combo) return null;
                            return (
                              <div key={combo.id} style={{marginTop: 8, background: 'rgba(30,64,175,0.13)', borderRadius: 8, padding: 8}}>
                                <b style={{color: '#f97316'}}>Combo: {combo.comboName}</b>
                                <ul style={{margin: 0, paddingLeft: 20}}>
                                  {comboSubjects.filter(cbs => cbs.comboId === combo.id).map(cbs => {
                                    const subj = subjects.find(s => s.id === cbs.subjectId);
                                    return subj ? <li key={subj.id} style={{color: '#1E40AF'}}>{subj.subjectName} ({subj.subjectCode})</li> : null;
                                  })}
                                </ul>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </Panel>
        ))}
      </Collapse>
    </div>
  );
};

export default CurriculumPage;