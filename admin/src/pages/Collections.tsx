import {
  Table,
  Button,
  Space,
  Card,
  Modal,
  Form,
  Input,
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
import { Collection, CollectionListItem } from '@/types'
import { collectionsService } from '@/services/collections'
import CollectionProductsModal from '@/components/CollectionProductsModal'

export default function CollectionsPage() {
  const [collections, setCollections] = useState<CollectionListItem[]>([])
  const [loading, setLoading] = useState(false)
  const [formVisible, setFormVisible] = useState(false)
  const [editingCollection, setEditingCollection] = useState<Collection | undefined>()
  const [form] = Form.useForm()
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [productsModalVisible, setProductsModalVisible] = useState(false)
  const [currentCollectionId, setCurrentCollectionId] = useState<number | undefined>()

  // 加载集合列表
  useEffect(() => {
    loadCollections()
  }, [pagination.current, pagination.pageSize])

  const loadCollections = async () => {
    try {
      setLoading(true)
      const data = await collectionsService.getCollections({
        page: pagination.current,
        limit: pagination.pageSize,
      })
      setCollections(data.items as CollectionListItem[])
      setPagination({ ...pagination, total: data.total })
    } catch (error) {
      message.error('加载集合列表失败')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenForm = (collection?: Collection) => {
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
      if (editingCollection) {
        await collectionsService.updateCollection(editingCollection.id, values)
        message.success('集合更新成功')
      } else {
        // 新增集合的逻辑
        message.info('集合创建功能未实现')
      }
      handleCloseForm()
      await loadCollections()
    } catch (error: any) {
      message.error(error.message || '操作失败')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await collectionsService.deleteCollection(id)
      message.success('集合删除成功')
      await loadCollections()
    } catch (error) {
      message.error('删除集合失败')
    }
  }

  const handleOpenProductsModal = (collectionId: number) => {
    setCurrentCollectionId(collectionId)
    setProductsModalVisible(true)
  }

  const columns = [
    {
      title: '集合名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
      width: 150,
      render: (slug: string | null | undefined) => slug ? <code style={{ color: '#c41d7f', backgroundColor: '#f5f5f5', padding: '2px 6px', borderRadius: 2 }}>{slug}</code> : '-',
    },
    {
      title: '产品数',
      dataIndex: 'productCount',
      key: 'productCount',
      width: 80,
      render: (count: number | undefined) => <Tag color="blue">{count || 0}</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      width: 280,
      render: (_: any, record: Collection) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<UnorderedListOutlined />}
            onClick={() => handleOpenProductsModal(record.id)}
          >
            管理产品
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
            description="确定要删除这个集合吗？"
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
      <Card title="集合管理" bordered={false}>
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
        title={editingCollection ? '编辑集合' : '新增集合'}
        open={formVisible}
        onOk={handleSubmitForm}
        onCancel={handleCloseForm}
        width={700}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="集合名称"
            name="name"
            rules={[
              { required: true, message: '请输入集合名称' },
              { max: 100, message: '集合名称不超过100个字符' },
            ]}
          >
            <Input placeholder="如：精品服饰" />
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
            <Input
              placeholder="如：premium-fashion"
              disabled={!!editingCollection}
              title={editingCollection ? '编辑时不允许修改Slug' : ''}
            />
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

      {/* 产品管理modal */}
      {currentCollectionId && (
        <CollectionProductsModal
          visible={productsModalVisible}
          collectionId={currentCollectionId}
          onClose={() => {
            setProductsModalVisible(false)
            loadCollections()
          }}
        />
      )}
    </Layout>
  )
}
