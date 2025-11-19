import { useState, useEffect } from 'react'
import { Table, Button, Space, Card, message, Modal, Form, Input, InputNumber, Popconfirm, Select, Tabs, Row, Col } from 'antd'
import { EditOutlined, DeleteOutlined, ReloadOutlined, PlusOutlined } from '@ant-design/icons'
import Layout from '@/components/Layout'
import { provincesService, citiesService, districtsService } from '@/services/regions'
import { useAuthStore } from '@/store'
import { Province, City, District } from '@/types'

export default function RegionsPage() {
  // 省份状态
  const [provinces, setProvinces] = useState<Province[]>([])
  const [provincesLoading, setProvincesLoading] = useState(false)
  const [provincesPagination, setProvincesPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [provinceModalOpen, setProvinceModalOpen] = useState(false)
  const [editingProvince, setEditingProvince] = useState<Province | null>(null)
  const [provinceForm] = Form.useForm()

  // 城市状态
  const [cities, setCities] = useState<City[]>([])
  const [citiesLoading, setCitiesLoading] = useState(false)
  const [citiesPagination, setCitiesPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [cityModalOpen, setCityModalOpen] = useState(false)
  const [editingCity, setEditingCity] = useState<City | null>(null)
  const [selectedProvinceId, setSelectedProvinceId] = useState<number | undefined>(undefined)
  const [cityForm] = Form.useForm()

  // 地区状态
  const [districts, setDistricts] = useState<District[]>([])
  const [districtsLoading, setDistrictsLoading] = useState(false)
  const [districtsPagination, setDistrictsPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [districtModalOpen, setDistrictModalOpen] = useState(false)
  const [editingDistrict, setEditingDistrict] = useState<District | null>(null)
  const [selectedCityId, setSelectedCityId] = useState<number | undefined>(undefined)
  const [districtForm] = Form.useForm()

  const { isHydrated } = useAuthStore()

  // 加载省份
  useEffect(() => {
    if (isHydrated) {
      loadProvinces()
    }
  }, [provincesPagination.current, provincesPagination.pageSize, isHydrated])

  // 加载城市（当选择省份变化时）
  useEffect(() => {
    if (isHydrated && selectedProvinceId) {
      loadCities()
    } else {
      setCities([])
      setSelectedCityId(undefined)
    }
  }, [selectedProvinceId, citiesPagination.current, citiesPagination.pageSize, isHydrated])

  // 加载地区（当选择城市变化时）
  useEffect(() => {
    if (isHydrated && selectedCityId) {
      loadDistricts()
    } else {
      setDistricts([])
    }
  }, [selectedCityId, districtsPagination.current, districtsPagination.pageSize, isHydrated])

  // ==================== 省份操作 ====================
  const loadProvinces = async () => {
    setProvincesLoading(true)
    try {
      const response = await provincesService.getProvinces({
        page: provincesPagination.current,
        limit: provincesPagination.pageSize,
      })
      setProvinces(response.items)
      setProvincesPagination({ ...provincesPagination, total: response.total })
    } catch (error) {
      message.error('加载省份列表失败')
      console.error(error)
    } finally {
      setProvincesLoading(false)
    }
  }

  const handleDeleteProvince = async (id: number) => {
    try {
      setProvincesLoading(true)
      await provincesService.deleteProvince(id)
      message.success('省份删除成功')
      if (selectedProvinceId === id) {
        setSelectedProvinceId(undefined)
      }
      loadProvinces()
    } catch (error) {
      message.error('删除省份失败')
      console.error(error)
    } finally {
      setProvincesLoading(false)
    }
  }

  const handleSaveProvince = async () => {
    try {
      const values = await provinceForm.validateFields()
      setProvincesLoading(true)

      if (editingProvince) {
        await provincesService.updateProvince(editingProvince.id, values)
        message.success('省份更新成功')
      } else {
        await provincesService.createProvince(values)
        message.success('省份创建成功')
      }

      setProvinceModalOpen(false)
      provinceForm.resetFields()
      loadProvinces()
    } catch (error) {
      message.error(editingProvince ? '更新省份失败' : '创建省份失败')
      console.error(error)
    } finally {
      setProvincesLoading(false)
    }
  }

  // ==================== 城市操作 ====================
  const loadCities = async () => {
    setCitiesLoading(true)
    try {
      const response = await citiesService.getCities({
        page: citiesPagination.current,
        limit: citiesPagination.pageSize,
        provinceId: selectedProvinceId,
      })
      setCities(response.items)
      setCitiesPagination({ ...citiesPagination, total: response.total })
    } catch (error) {
      message.error('加载城市列表失败')
      console.error(error)
    } finally {
      setCitiesLoading(false)
    }
  }

  const handleDeleteCity = async (id: number) => {
    try {
      setCitiesLoading(true)
      await citiesService.deleteCity(id)
      message.success('城市删除成功')
      if (selectedCityId === id) {
        setSelectedCityId(undefined)
      }
      loadCities()
    } catch (error) {
      message.error('删除城市失败')
      console.error(error)
    } finally {
      setCitiesLoading(false)
    }
  }

  const handleSaveCity = async () => {
    try {
      const values = await cityForm.validateFields()
      setCitiesLoading(true)

      if (editingCity) {
        await citiesService.updateCity(editingCity.id, values)
        message.success('城市更新成功')
      } else {
        await citiesService.createCity({ ...values, provinceId: selectedProvinceId })
        message.success('城市创建成功')
      }

      setCityModalOpen(false)
      cityForm.resetFields()
      loadCities()
    } catch (error) {
      message.error(editingCity ? '更新城市失败' : '创建城市失败')
      console.error(error)
    } finally {
      setCitiesLoading(false)
    }
  }

  // ==================== 地区操作 ====================
  const loadDistricts = async () => {
    setDistrictsLoading(true)
    try {
      const response = await districtsService.getDistricts({
        page: districtsPagination.current,
        limit: districtsPagination.pageSize,
        cityId: selectedCityId,
      })
      setDistricts(response.items)
      setDistrictsPagination({ ...districtsPagination, total: response.total })
    } catch (error) {
      message.error('加载地区列表失败')
      console.error(error)
    } finally {
      setDistrictsLoading(false)
    }
  }

  const handleDeleteDistrict = async (id: number) => {
    try {
      setDistrictsLoading(true)
      await districtsService.deleteDistrict(id)
      message.success('地区删除成功')
      loadDistricts()
    } catch (error) {
      message.error('删除地区失败')
      console.error(error)
    } finally {
      setDistrictsLoading(false)
    }
  }

  const handleSaveDistrict = async () => {
    try {
      const values = await districtForm.validateFields()
      setDistrictsLoading(true)

      if (editingDistrict) {
        await districtsService.updateDistrict(editingDistrict.id, values)
        message.success('地区更新成功')
      } else {
        await districtsService.createDistrict({ ...values, cityId: selectedCityId })
        message.success('地区创建成功')
      }

      setDistrictModalOpen(false)
      districtForm.resetFields()
      loadDistricts()
    } catch (error) {
      message.error(editingDistrict ? '更新地区失败' : '创建地区失败')
      console.error(error)
    } finally {
      setDistrictsLoading(false)
    }
  }

  // ==================== 表格列定义 ====================
  const provinceColumns = [
    { title: '名称', dataIndex: 'name', key: 'name' },
    {
      title: '操作',
      key: 'actions',
      width: 80,
      render: (_: any, record: Province) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingProvince(record)
              provinceForm.setFieldsValue(record)
              setProvinceModalOpen(true)
            }}
          />
          <Popconfirm
            title="删除省份"
            description="此操作会删除该省份下所有城市和地区"
            onConfirm={() => handleDeleteProvince(record.id)}
            okText="删除"
            cancelText="取消"
          >
            <Button danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const cityColumns = [
    { title: '名称', dataIndex: 'name', key: 'name' },
    {
      title: '操作',
      key: 'actions',
      width: 80,
      render: (_: any, record: City) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingCity(record)
              cityForm.setFieldsValue(record)
              setCityModalOpen(true)
            }}
          />
          <Popconfirm
            title="删除城市"
            description="此操作会删除该城市下所有地区"
            onConfirm={() => handleDeleteCity(record.id)}
            okText="删除"
            cancelText="取消"
          >
            <Button danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const districtColumns = [
    { title: '名称', dataIndex: 'name', key: 'name' },
    {
      title: '操作',
      key: 'actions',
      width: 80,
      render: (_: any, record: District) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingDistrict(record)
              districtForm.setFieldsValue(record)
              setDistrictModalOpen(true)
            }}
          />
          <Popconfirm
            title="删除地区"
            onConfirm={() => handleDeleteDistrict(record.id)}
            okText="删除"
            cancelText="取消"
          >
            <Button danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <Layout>
      <div className="p-3">
        <Card title="地区管理" style={{ marginTop: 24 }}>
          <Row gutter={16}>
            {/* 省份列表 */}
            <Col span={8}>
              <Card
                size="small"
                title="省份"
                extra={
                  <Space>
                    <Button
                      type="primary"
                      size="small"
                      icon={<PlusOutlined />}
                      onClick={() => {
                        setEditingProvince(null)
                        provinceForm.resetFields()
                        provinceForm.setFieldsValue({ sortOrder: 0 })
                        setProvinceModalOpen(true)
                      }}
                    >
                      新增
                    </Button>
                    <Button
                      size="small"
                      icon={<ReloadOutlined />}
                      onClick={loadProvinces}
                      loading={provincesLoading}
                    />
                  </Space>
                }
              >
                <Table
                  columns={provinceColumns}
                  dataSource={provinces}
                  loading={provincesLoading}
                  rowKey="id"
                  size="small"
                  pagination={{
                    size: 'small',
                    current: provincesPagination.current,
                    pageSize: provincesPagination.pageSize,
                    total: provincesPagination.total,
                    showSizeChanger: false,
                    onChange: (page) => setProvincesPagination({ ...provincesPagination, current: page }),
                  }}
                  onRow={(record) => ({
                    onClick: () => {
                      setSelectedProvinceId(record.id)
                      setSelectedCityId(undefined)
                      setCitiesPagination({ ...citiesPagination, current: 1 })
                    },
                    style: {
                      cursor: 'pointer',
                      background: selectedProvinceId === record.id ? '#e6f7ff' : undefined,
                    },
                  })}
                  scroll={{ y: 400 }}
                />
              </Card>
            </Col>

            {/* 城市列表 */}
            <Col span={8}>
              <Card
                size="small"
                title={selectedProvinceId ? `城市 (${provinces.find(p => p.id === selectedProvinceId)?.name || ''})` : '城市 (请先选择省份)'}
                extra={
                  <Space>
                    <Button
                      type="primary"
                      size="small"
                      icon={<PlusOutlined />}
                      disabled={!selectedProvinceId}
                      onClick={() => {
                        setEditingCity(null)
                        cityForm.resetFields()
                        cityForm.setFieldsValue({ sortOrder: 0 })
                        setCityModalOpen(true)
                      }}
                    >
                      新增
                    </Button>
                    <Button
                      size="small"
                      icon={<ReloadOutlined />}
                      onClick={loadCities}
                      loading={citiesLoading}
                      disabled={!selectedProvinceId}
                    />
                  </Space>
                }
              >
                <Table
                  columns={cityColumns}
                  dataSource={cities}
                  loading={citiesLoading}
                  rowKey="id"
                  size="small"
                  pagination={{
                    size: 'small',
                    current: citiesPagination.current,
                    pageSize: citiesPagination.pageSize,
                    total: citiesPagination.total,
                    showSizeChanger: false,
                    onChange: (page) => setCitiesPagination({ ...citiesPagination, current: page }),
                  }}
                  onRow={(record) => ({
                    onClick: () => {
                      setSelectedCityId(record.id)
                      setDistrictsPagination({ ...districtsPagination, current: 1 })
                    },
                    style: {
                      cursor: 'pointer',
                      background: selectedCityId === record.id ? '#e6f7ff' : undefined,
                    },
                  })}
                  scroll={{ y: 400 }}
                />
              </Card>
            </Col>

            {/* 地区列表 */}
            <Col span={8}>
              <Card
                size="small"
                title={selectedCityId ? `地区 (${cities.find(c => c.id === selectedCityId)?.name || ''})` : '地区 (请先选择城市)'}
                extra={
                  <Space>
                    <Button
                      type="primary"
                      size="small"
                      icon={<PlusOutlined />}
                      disabled={!selectedCityId}
                      onClick={() => {
                        setEditingDistrict(null)
                        districtForm.resetFields()
                        districtForm.setFieldsValue({ sortOrder: 0 })
                        setDistrictModalOpen(true)
                      }}
                    >
                      新增
                    </Button>
                    <Button
                      size="small"
                      icon={<ReloadOutlined />}
                      onClick={loadDistricts}
                      loading={districtsLoading}
                      disabled={!selectedCityId}
                    />
                  </Space>
                }
              >
                <Table
                  columns={districtColumns}
                  dataSource={districts}
                  loading={districtsLoading}
                  rowKey="id"
                  size="small"
                  pagination={{
                    size: 'small',
                    current: districtsPagination.current,
                    pageSize: districtsPagination.pageSize,
                    total: districtsPagination.total,
                    showSizeChanger: false,
                    onChange: (page) => setDistrictsPagination({ ...districtsPagination, current: page }),
                  }}
                  scroll={{ y: 400 }}
                />
              </Card>
            </Col>
          </Row>
        </Card>
      </div>

      {/* 省份 Modal */}
      <Modal
        title={editingProvince ? '编辑省份' : '新增省份'}
        open={provinceModalOpen}
        onOk={handleSaveProvince}
        onCancel={() => {
          setProvinceModalOpen(false)
          provinceForm.resetFields()
          setEditingProvince(null)
        }}
        confirmLoading={provincesLoading}
      >
        <Form form={provinceForm} layout="vertical" style={{ marginTop: 20 }}>
          <Form.Item label="名称" name="name" rules={[{ required: true, message: '请输入省份名称' }]}>
            <Input placeholder="例如：北京市" />
          </Form.Item>
          <Form.Item label="代码" name="code" rules={[{ required: true, message: '请输入省份代码' }]}>
            <Input placeholder="例如：BJ" />
          </Form.Item>
          <Form.Item label="排序" name="sortOrder">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 城市 Modal */}
      <Modal
        title={editingCity ? '编辑城市' : '新增城市'}
        open={cityModalOpen}
        onOk={handleSaveCity}
        onCancel={() => {
          setCityModalOpen(false)
          cityForm.resetFields()
          setEditingCity(null)
        }}
        confirmLoading={citiesLoading}
      >
        <Form form={cityForm} layout="vertical" style={{ marginTop: 20 }}>
          <Form.Item label="名称" name="name" rules={[{ required: true, message: '请输入城市名称' }]}>
            <Input placeholder="例如：朝阳区" />
          </Form.Item>
          <Form.Item label="代码" name="code" rules={[{ required: true, message: '请输入城市代码' }]}>
            <Input placeholder="例如：CITY_01" />
          </Form.Item>
          <Form.Item label="排序" name="sortOrder">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 地区 Modal */}
      <Modal
        title={editingDistrict ? '编辑地区' : '新增地区'}
        open={districtModalOpen}
        onOk={handleSaveDistrict}
        onCancel={() => {
          setDistrictModalOpen(false)
          districtForm.resetFields()
          setEditingDistrict(null)
        }}
        confirmLoading={districtsLoading}
      >
        <Form form={districtForm} layout="vertical" style={{ marginTop: 20 }}>
          <Form.Item label="名称" name="name" rules={[{ required: true, message: '请输入地区名称' }]}>
            <Input placeholder="例如：建国门街道" />
          </Form.Item>
          <Form.Item label="代码" name="code" rules={[{ required: true, message: '请输入地区代码' }]}>
            <Input placeholder="例如：DIST_01" />
          </Form.Item>
          <Form.Item label="排序" name="sortOrder">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  )
}
