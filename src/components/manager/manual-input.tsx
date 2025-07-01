import React from 'react';
import { Form, Input, Select, Button, Card } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

interface ManualInputProps {
  title: string;
  icon: string;
  formItems: {
    name: string;
    label: string;
    type: 'input' | 'textarea' | 'select' | 'multiSelect' | 'number';
    required?: boolean;
    placeholder?: string;
    options?: { value: string; label: string }[];
    rows?: number;
  }[];
  onSubmit: (values: any) => void;
  initialValues?: any;
}

const ManualInput: React.FC<ManualInputProps> = ({
  title,
  icon,
  formItems,
  onSubmit,
  initialValues = {}
}) => {
  const [form] = Form.useForm();

  const handleSubmit = (values: any) => {
    onSubmit(values);
    form.resetFields();
  };

  const renderFormItem = (item: any) => {
    const commonProps = {
      placeholder: item.placeholder,
      className: "rounded-lg"
    };

    switch (item.type) {
      case 'input':
        return <Input {...commonProps} />;
      
      case 'textarea':
        return <TextArea rows={item.rows || 2} {...commonProps} />;
      
      case 'number':
        return <Input type="number" {...commonProps} />;
      
      case 'select':
        return (
          <Select {...commonProps}>
            {item.options?.map((opt: any) => (
              <Option key={opt.value} value={opt.value}>
                {opt.label}
              </Option>
            ))}
          </Select>
        );
      
      case 'multiSelect':
        return (
          <Select
            mode="multiple"
            {...commonProps}
            options={item.options}
          />
        );
      
      default:
        return <Input {...commonProps} />;
    }
  };

  return (
    <Card title="Manual Input" className="shadow-md">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={initialValues}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            {formItems.slice(0, Math.ceil(formItems.length / 2)).map((item, index) => (
              <Form.Item
                key={index}
                name={item.name}
                label={item.label}
                rules={item.required ? [{ required: true, message: `Please enter ${item.label.toLowerCase()}!` }] : []}
              >
                {renderFormItem(item)}
              </Form.Item>
            ))}
          </div>

          <div>
            {formItems.slice(Math.ceil(formItems.length / 2)).map((item, index) => (
              <Form.Item
                key={index}
                name={item.name}
                label={item.label}
                rules={item.required ? [{ required: true, message: `Please enter ${item.label.toLowerCase()}!` }] : []}
              >
                {renderFormItem(item)}
              </Form.Item>
            ))}

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                icon={<PlusOutlined />}
                className="w-full rounded-lg"
              >
                Add {title}
              </Button>
            </Form.Item>
          </div>
        </div>
      </Form>
    </Card>
  );
};

export default ManualInput; 