import { useEffect, useState } from 'react'
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Switch,
  Space,
  message,
  Popconfirm,
  Image,
  Upload,
  Spin,
} from 'antd'
import { EditOutlined, DeleteOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons'
import Layout from '@/components/Layout'
import { MemberBenefit, MemberBenefitListItem } from '@/types'
import { memberBenefitsService } from '@/services/member-benefits'

const MemberBenefitsPage = () => {
  const [benefits, setBenefits] = useState<MemberBenefitListItem[]>([])
  const [loading, setLoading] = useState(false)
  const [formVisible, setFormVisible] = useState(false)
  const [editingBenefit, setEditingBenefit] = useState<MemberBenefit | undefined>()
  const [form] = Form.useForm()
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [searchKeyword, setSearchKeyword] = useState('')
  const [imageLoading, setImageLoading] = useState(false)
  const [uploadingId, setUploadingId] = useState<number | null>(null)

  // 初始化加载
  useEffect(() => {
    loadBenefits()
  }, [pagination.current, pagination.pageSize])

  const loadBenefits = async () => {
    try {
      setLoading(true)
      const data = await memberBenefitsService.getMemberBenefits({
        page: pagination.current,
        limit: pagination.pageSize,
        keyword: searchKeyword || undefined,
      })
      setBenefits(data.items)
      setPagination({ ...pagination, total: data.total })
    } catch (error) {
      message.error('加载会员礼遇失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (value: string) => {
    setSearchKeyword(value)
    setPagination({ ...pagination, current: 1 })
    const data = await memberBenefitsService.getMemberBenefits({
      page: 1,
      limit: pagination.pageSize,
      keyword: value || undefined,
    })
    setBenefits(data.items)
    setPagination({ ...pagination, current: 1, total: data.total })
  }

  const handleReset = async () => {
    setSearchKeyword('')
    setPagination({ ...pagination, current: 1 })
    const data = await memberBenefitsService.getMemberBenefits({
      page: 1,
      limit: pagination.pageSize,
    })
    setBenefits(data.items)
    setPagination({ ...pagination, current: 1, total: data.total })
  }

  const handleOpenForm = (benefit?: MemberBenefit) => {
    setEditingBenefit(benefit)
    if (benefit) {
      form.setFieldsValue({
        title: benefit.title,
        subtitle: benefit.subtitle,
        sortOrder: benefit.sortOrder,
        isActive: benefit.isActive,
      })
    } else {
      form.resetFields()
    }
    setFormVisible(true)
  }

  const handleCloseForm = () => {
    setFormVisible(false)
    setEditingBenefit(undefined)
    form.resetFields()
  }

  const handleSubmitForm = async (values: any) => {
    try {
      if (editingBenefit) {
        await memberBenefitsService.updateMemberBenefit(editingBenefit.id, values)
        message.success('更新成功')
      } else {
        await memberBenefitsService.createMemberBenefit(values)
        message.success('创建成功')
      }
      handleCloseForm()
      await loadBenefits()
    } catch (error) {
      message.error('保存失败')
    }
  }

  const handleEdit = async (id: number) => {
    try {
      const benefit = await memberBenefitsService.getMemberBenefitById(id)
      handleOpenForm(benefit)
    } catch (error) {
      message.error('获取详情失败')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await memberBenefitsService.deleteMemberBenefit(id)
      message.success('删除成功')
      await loadBenefits()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleImageUpload = async (info: any, benefitId: number) => {
    const file = info.file
    if (!file) return

    try {
      setImageLoading(true)
      setUploadingId(benefitId)
      await memberBenefitsService.uploadImage(benefitId, file)
      message.success('图片上传成功')
      await loadBenefits()
    } catch (error) {
      message.error('上传失败')
    } finally {
      setImageLoading(false)
      setUploadingId(null)
    }
  }

  const columns = [
    {
      title: '图片',
      dataIndex: 'imageUrl',
      key: 'image',
      width: 100,
      render: (imageUrl: string | null | undefined) =>
        imageUrl ? (
          <Image
            src={imageUrl}
            alt="礼遇"
            width={60}
            height={60}
            preview={{ mask: '查看' }}
          />
        ) : (
          <span style={{ color: '#999' }}>无图片</span>
        ),
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      width: 150,
      render: (text: string, record: MemberBenefitListItem) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          {record.subtitle && (
            <div style={{ fontSize: '12px', color: '#999' }}>{record.subtitle}</div>
          )}
        </div>
      ),
    },
    {
      title: '排序',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 80,
      render: (sortOrder: number) => sortOrder,
    },
    {
      title: '启用',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 80,
      render: (isActive: boolean) => (
        <span style={{ color: isActive ? '#52c41a' : '#f5222d' }}>
          {isActive ? '✓ 启用' : '✗ 禁用'}
        </span>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (createdAt: string) => new Date(createdAt).toLocaleString(),
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      fixed: 'right' as const,
      render: (_: any, record: MemberBenefitListItem) => (
        <Space size="small">
          <Upload
            maxCount={1}
            beforeUpload={() => false}
            onChange={(info) => handleImageUpload(info, record.id)}
            showUploadList={false}
          >
            <Button
              type="default"
              size="small"
              icon={<UploadOutlined />}
              loading={imageLoading && uploadingId === record.id}
            >
              上传
            </Button>
          </Upload>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record.id)}
          >
            编辑
          </Button>
          <Popconfirm
            title="删除礼遇"
            description="确定要删除此礼遇吗？"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button danger size="small" icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <Layout>
      <div style={{ padding: '24px' }}>
        <Card
        title="会员礼遇管理"
        extra={
          <Space>
            <Input.Search
              placeholder="搜索标题"
              allowClear
              onSearch={handleSearch}
              style={{ width: 200 }}
            />
            <Button onClick={handleReset}>重置</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenForm()}>
              新增
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={benefits.map((b) => ({ ...b, key: b.id }))}
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 个礼遇`,
            onChange: (page, pageSize) => {
              setPagination({ ...pagination, current: page, pageSize })
            },
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      <Modal
        title={editingBenefit ? '编辑礼遇' : '新增礼遇'}
        open={formVisible}
        onOk={() => form.submit()}
        onCancel={handleCloseForm}
        width={600}
      >
        <Spin spinning={imageLoading}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmitForm}
            autoComplete="off"
          >
            <Form.Item
              label="礼遇标题"
              name="title"
              rules={[{ required: true, message: '请输入礼遇标题' }]}
            >
              <Input placeholder="例如：加入会员享受折扣" />
            </Form.Item>

            <Form.Item
              label="礼遇副标题"
              name="subtitle"
            >
              <Input placeholder="例如：享受独家优惠权益" />
            </Form.Item>

            <Form.Item
              label="排序"
              name="sortOrder"
              initialValue={0}
            >
              <InputNumber min={0} placeholder="输入排序号，越小越靠前" />
            </Form.Item>

            <Form.Item
              label="启用"
              name="isActive"
              valuePropName="checked"
              initialValue={true}
            >
              <Switch />
            </Form.Item>

            {editingBenefit && editingBenefit.imageUrl && (
              <Form.Item label="当前图片">
                <Image
                  src={editingBenefit.imageUrl}
                  alt="当前礼遇图片"
                  width={200}
                  preview={{ mask: '查看' }}
                />
              </Form.Item>
            )}
          </Form>
        </Spin>
      </Modal>
      </div>
    </Layout>
  )
}

export default MemberBenefitsPage
