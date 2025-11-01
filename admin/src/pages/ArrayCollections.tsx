import {
  Table,
  Button,
  Space,
  Card,
  Modal,
  Form,
  Input,
  InputNumber,
  Checkbox,
  message,
  Popconfirm,
  Tag,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons'
import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import { arrayCollectionsService } from '@/services/array-collections'
import ArrayCollectionItemsModal from '@/components/ArrayCollectionItemsModal'

interface ArrayCollection {
  id: number
  title: string
  slug?: string | null
  description: string
  sortOrder: number
  isActive: boolean
  itemCount: number
  remark: string
  createdAt: Date
  updatedAt: Date
}

export default function ArrayCollectionsPage() {
  const [collections, setCollections] = useState<ArrayCollection[]>([])
  const [loading, setLoading] = useState(false)
  const [formVisible, setFormVisible] = useState(false)
  const [editingCollection, setEditingCollection] = useState<ArrayCollection | undefined>()
  const [form] = Form.useForm()
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [itemsModalVisible, setItemsModalVisible] = useState(false)
  const [currentCollectionId, setCurrentCollectionId] = useState<number | undefined>()

  // 加载列表
  useEffect(() => {
    loadCollections()
  }, [pagination.current, pagination.pageSize])

  const loadCollections = async () => {
    try {
      setLoading(true)
      const data = await arrayCollectionsService.getArrayCollections({
        page: pagination.current,
        limit: pagination.pageSize,
      })
      setCollections(data.items as ArrayCollection[])
      setPagination({ ...pagination, total: data.total })
    } catch (error) {
      message.error('加载数组集合列表失败')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenForm = (collection?: ArrayCollection) => {
    if (collection) {
      setEditingCollection(collection)
      form.setFieldsValue(collection)
    } else {
      setEditingCollection(undefined)
      form.resetFields()
    }
    setFormVisible(true)
  }

  const handleCloseForm = () => {
    setFormVisible(false)
    setEditingCollection(undefined)
    form.resetFields()
  }

  const handleSubmitForm = async () => {
    try {
      const values = await form.validateFields()

      // 新增时添加默认值，编辑时保持原值
      if (!editingCollection) {
        values.sortOrder = 0
        values.isActive = true
        values.remark = ''
      }

      if (editingCollection) {
        await arrayCollectionsService.updateArrayCollection(editingCollection.id, values)
        message.success('数组集合更新成功')
      } else {
        await arrayCollectionsService.createArrayCollection(values)
        message.success('数组集合创建成功')
      }
      handleCloseForm()
      await loadCollections()
    } catch (error: any) {
      console.error('Error details:', error)
      message.error(error.response?.data?.message || error.message || '操作失败')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await arrayCollectionsService.deleteArrayCollection(id)
      message.success('数组集合删除成功')
      await loadCollections()
    } catch (error) {
      message.error('删除数组集合失败')
    }
  }

  const handleOpenItemsModal = (collectionId: number) => {
    setCurrentCollectionId(collectionId)
    setItemsModalVisible(true)
  }

  const columns = [
    {
      title: '集合名称',
      dataIndex: 'title',
      key: 'title',
      width: 200,
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
      width: 150,
      render: (slug: string | null) => slug || '-',
    },
    {
      title: '卡片数',
      dataIndex: 'itemCount',
      key: 'itemCount',
      width: 80,
      render: (count: number) => <Tag color="blue">{count}</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      width: 280,
      render: (_: any, record: ArrayCollection) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<UnorderedListOutlined />}
            onClick={() => handleOpenItemsModal(record.id)}
          >
            管理卡片
          </Button>
          <Button
            type="default"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleOpenForm(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="删除集合"
            description="确定要删除这个数组集合吗？"
            okText="确定"
            cancelText="取消"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="default" danger size="small" icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <Layout>
      <Card title="数组集合管理" bordered={false}>
        <Space style={{ marginBottom: 16 }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleOpenForm()}
          >
            新增集合
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => loadCollections()}
            loading={loading}
          >
            刷新
          </Button>
        </Space>

        <Table
          columns={columns}
          dataSource={collections}
          loading={loading}
          rowKey="id"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 个集合`,
          }}
          onChange={(newPagination) => {
            setPagination({
              current: newPagination.current || 1,
              pageSize: newPagination.pageSize || 10,
              total: pagination.total,
            })
          }}
        />
      </Card>

      {/* 创建/编辑集合表单 */}
      <Modal
        title={editingCollection ? '编辑数组集合' : '新增数组集合'}
        open={formVisible}
        onOk={handleSubmitForm}
        onCancel={handleCloseForm}
        width={700}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="集合名称"
            name="title"
            rules={[
              { required: true, message: '请输入集合名称' },
              { max: 100, message: '集合名称不超过100个字符' },
            ]}
          >
            <Input placeholder="如：品牌故事" />
          </Form.Item>

          <Form.Item
            label="Slug"
            name="slug"
            rules={[
              { max: 100, message: 'Slug不超过100个字符' },
              {
                pattern: /^[a-z0-9-]*$/,
                message: 'Slug只能包含小写字母、数字和中划线',
              },
            ]}
          >
            <Input placeholder="如：brand-story" />
          </Form.Item>

          <Form.Item
            label="描述"
            name="description"
            rules={[{ max: 500, message: '描述不超过500个字符' }]}
          >
            <Input.TextArea rows={3} placeholder="集合描述" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 卡片管理modal */}
      {currentCollectionId && (
        <ArrayCollectionItemsModal
          visible={itemsModalVisible}
          collectionId={currentCollectionId}
          onClose={() => {
            setItemsModalVisible(false)
            loadCollections()
          }}
        />
      )}
    </Layout>
  )
}
