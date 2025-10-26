import { AddressesService } from './addresses.service';
import { CreateAddressDto, UpdateAddressDto } from './dto/create-address.dto';
export declare class AddressesController {
    private readonly addressesService;
    constructor(addressesService: AddressesService);
    create(user: any, createAddressDto: CreateAddressDto): unknown;
    findAll(user: any): unknown;
    getDefault(user: any): unknown;
    findOne(id: string): unknown;
    update(id: string, updateAddressDto: UpdateAddressDto): unknown;
    setDefault(user: any, id: string): unknown;
    remove(id: string): unknown;
}
