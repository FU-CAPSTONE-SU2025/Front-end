import React, { useState, useEffect } from 'react';
import { Input, Button, Collapse, Affix, Space, message, Spin } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, UploadOutlined } from '@ant-design/icons';
import styles from '../../css/staff/staffTranscript.module.css';
import { useNavigate } from 'react-router';
import BulkDataImport from '../../components/common/bulkDataImport';
import { useCRUDProgram, useCRUDCurriculum } from '../../hooks/useCRUDSchoolMaterial';
import { CreateProgram } from '../../interfaces/ISchoolProgram';
import { isErrorResponse, getUserFriendlyErrorMessage } from '../../api/AxiosCRUD';

const { Panel } = Collapse;

const ProgramPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [isImportOpen, setIsImportOpen] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const navigate = useNavigate();

  // Use the new CRUD hooks
  const {
    getAllPrograms,
    programList,
    paginationProgram,
    isLoading,
    addMultipleProgramsMutation
  } = useCRUDProgram();

  const { getCurriculumMutation } = useCRUDCurriculum();

  // Fetch programs on component mount and when page changes
  useEffect(() => {
    getAllPrograms({
      pageNumber: currentPage,
      pageSize: pageSize,
      searchQuery: search
    });
  }, [currentPage, pageSize, getAllPrograms]);

  // Fetch programs when search changes (with debounce could be added)
  useEffect(() => {
    if (search !== '') {
      getAllPrograms({
        pageNumber: 1,
        pageSize: pageSize,
        searchQuery: search
      });
    } else {
      getAllPrograms({
        pageNumber: currentPage,
        pageSize: pageSize
      });
    }
  }, [search, getAllPrograms, currentPage, pageSize]);

  // Remove the automatic success handling effect to prevent false positives
  // Success handling is now only done in the mutation's onSuccess callback

  const handleAddProgram = () => {
    navigate('/staff/editData/program');
  };

  const handleEditProgram = (programId: number) => {
    navigate(`/staff/editData/program/${programId}`);
  };

  const handleDataImported = async (importedData: { [type: string]: { [key: string]: string }[] }) => {
    try {
      // Extract program data from the imported data
      const programData = importedData['PROGRAM'] || [];
      
      if (programData.length === 0) {
        message.warning('No program data found in the imported file');
        return;
      }

      // Transform the imported data to match CreateProgram interface
      const transformedData: CreateProgram[] = programData.map(item => ({
        programName: item.programName || item['Program Name'] || item.ProgramName || '',
        programCode: item.programCode || item['Program Code'] || item.ProgramCode || ''
      }));

      // Validate the data
      const validData = transformedData.filter(item => 
        item.programName.trim() !== '' && item.programCode.trim() !== ''
      );

      if (validData.length === 0) {
        message.error('No valid program data found. Please check your data format.');
        return;
      }

      if (validData.length !== transformedData.length) {
        message.warning(`${transformedData.length - validData.length} rows were skipped due to missing required fields.`);
      }

      // Call the bulk import mutation
      addMultipleProgramsMutation.mutate(validData, {
        onSuccess: () => {
          message.success(`Successfully imported ${validData.length} programs`);
          setIsImportOpen(false);
          // Refresh the program list
          getAllPrograms({
            pageNumber: currentPage,
            pageSize: pageSize,
            searchQuery: search
          });
        },
        onError: (error: any) => {
          console.error('Import error:', error);
          const errorMessage = getUserFriendlyErrorMessage(error);
          message.error(errorMessage);
        }
      });

    } catch (error) {
      console.error('Import error:', error);
      const errorMessage = getUserFriendlyErrorMessage(error);
      message.error(errorMessage);
    }
  };

  return (
    <div className={styles.sttContainer}>
      {/* Sticky Toolbar */}
      <Affix style={{zIndex: 10}}>
        <div style={{background: 'rgba(255, 255, 255, 0.90)', borderRadius: 20, boxShadow: '0 4px 18px rgba(30,64,175,0.13)', border: '1.5px solid rgba(255,255,255,0.18)', padding: 24, marginBottom: 32, display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center'}}>
          <Input
            placeholder="Search by Program ID or Name"
            prefix={<SearchOutlined />}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{maxWidth: 240, borderRadius: 999}}
            size="large"
          />
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            size="large" 
            style={{borderRadius: 999}}
            onClick={handleAddProgram}
          >
            Add Program
          </Button>
          <Button 
            type="default" 
            icon={<UploadOutlined />} 
            size="large" 
            style={{borderRadius: 999, borderColor: '#10B981', color: '#10B981'}} 
            onClick={() => setIsImportOpen(true)}
            loading={addMultipleProgramsMutation.isPending}
          >
            Import Programs
          </Button>
        </div>
      </Affix>

      {/* Loading State */}
      {isLoading && (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
          <p style={{ marginTop: 16, color: '#1E40AF' }}>Loading programs...</p>
        </div>
      )}

      {/* Program Cards */}
      {!isLoading && (
        <Collapse 
          accordion 
          bordered={false} 
          className={styles.sttFreshTable} 
          style={{background: 'rgba(255, 255, 255, 0.90)', borderRadius: 20, boxShadow: '0 10px 40px rgba(30,64,175,0.13)'}}
          items={programList.map(program => ({
            key: program.id,
            label: (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <span style={{fontWeight: 700, fontSize: '1.2rem', color: '#1E40AF'}}>
                  {program.programName} <span style={{color: '#f97316', fontWeight: 400, marginLeft: 8}}>[{program.programCode}]</span>
                </span>
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditProgram(program.id);
                  }}
                  style={{ 
                    color: '#1E40AF',
                    borderRadius: 8,
                    height: 32,
                    padding: '0 12px'
                  }}
                >
                  Edit
                </Button>
              </div>
            ),
            children: (
              <div style={{padding: 16, color: '#1E40AF', fontWeight: 500}}>
                <b>Program ID:</b> {program.id}<br/>
                <b>Program Code:</b> {program.programCode}<br/>
                <b>Program Name:</b> {program.programName}<br/>
                {/* TODO: Add curriculum details when expanded */}
                <div style={{marginTop: 12, fontStyle: 'italic', color: '#6B7280'}}>
                  Click to view curriculum details...
                </div>
              </div>
            ),
            style: {background: 'rgba(255, 255, 255, 0.90)', borderRadius: 16, marginBottom: 12, color: '#1E40AF', boxShadow: '0 2px 12px rgba(30,64,175,0.13)'}
          }))}
        />
      )}

      {/* Empty State */}
      {!isLoading && programList.length === 0 && (
        <div style={{ textAlign: 'center', padding: '50px', background: 'rgba(255, 255, 255, 0.90)', borderRadius: 20, boxShadow: '0 10px 40px rgba(30,64,175,0.13)' }}>
          <p style={{ color: '#6B7280', fontSize: '1.1rem' }}>
            {search ? `No programs found matching "${search}"` : 'No programs available'}
          </p>
          {!search && (
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              size="large" 
              style={{borderRadius: 999, marginTop: 16}}
              onClick={handleAddProgram}
            >
              Add Your First Program
            </Button>
          )}
        </div>
      )}
      
      {/* Data Import Modal */}
      {isImportOpen && (
        <BulkDataImport 
          onClose={() => setIsImportOpen(false)} 
          onDataImported={handleDataImported}
          supportedTypes={['PROGRAM']}
        />
      )}
    </div>
  );
};

export default ProgramPage;