import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { City } from './entities/cities.entity';
import { CitiesRepository } from './cities.repository';

@Injectable()
export class CitiesService {
  constructor(private readonly citiesRepository: CitiesRepository) {}

  async create(createCityDto: CreateCityDto): Promise<City> {
    const { name } = createCityDto;

    if (name) {
      const city = await this.citiesRepository.findOne({
        where: { name: name },
      });

      if (city) {
        throw new ConflictException(`Такой город уже существует`);
      }
    }

    return this.citiesRepository.createCity(createCityDto);
  }

  async findAll() {
    return await this.citiesRepository.find();
  }

  async findOne(id: number) {
    const city = await this.citiesRepository.findById(id);
    if (!city) {
      throw new NotFoundException(`Город ${id} не найден`);
    }
    return city;
  }

  async update(id: number, updateCityDto: UpdateCityDto) {
    const city = await this.citiesRepository.findById(id);
    if (!city) {
      throw new NotFoundException(`Город ${id} не найден`);
    }

    const updatedCity = await this.citiesRepository.updateCity(
      id,
      updateCityDto,
    );
    if (!updatedCity) {
      throw new NotFoundException(`Город ${id} не найден`);
    }
    return updatedCity;
  }

  async remove(id: number) {
    const city = await this.citiesRepository.findById(id);

    if (!city) {
      throw new NotFoundException(`Город ${id} не найден`);
    }

    await this.citiesRepository.deleteCity(id);

    return { message: 'Город успешно удален' };
  }
}
