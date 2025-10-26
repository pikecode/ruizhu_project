import { Repository } from 'typeorm';
import { Address } from './entities/address.entity';
import { CreateAddressDto, UpdateAddressDto } from './dto/create-address.dto';
export declare class AddressesService {
    private addressRepository;
    constructor(addressRepository: Repository<Address>);
    create(userId: number, createAddressDto: CreateAddressDto): Promise<Address>;
    findByUserId(userId: number): Promise<Address[]>;
    findOne(id: number): Promise<Address | null>;
    getDefaultAddress(userId: number): Promise<Address | null>;
    update(id: number, updateAddressDto: UpdateAddressDto): Promise<Address | null>;
    remove(id: number): Promise<void>;
    setDefault(userId: number, addressId: number): Promise<Address | null>;
}
