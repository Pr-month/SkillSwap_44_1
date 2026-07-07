import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { City } from './entities/cities.entity';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';

@Injectable()
export class CitiesRepository extends Repository<City> {
  constructor(private readonly dataSource: DataSource) {
    super(City, dataSource.createEntityManager());
  }

  async createCity(dto: CreateCityDto): Promise<City> {
    const city = this.create({
      name: dto.name,
    });

    return this.save(city);
  }

  async findById(id: number): Promise<City | null> {
    return this.findOne({
      where: { id: String(id) },
    });
  }

  findCities(search?: string): Promise<City[]> {
    const query = this.createQueryBuilder('city');

    query.where('city.name ILIKE :search', {
      search: `%${search}%`,
    });

    query.take(10);

    return query.getMany();
  }

  async updateCity(id: number, dto: UpdateCityDto): Promise<City | null> {
    const updateValues: Partial<City> = {};

    if (dto.name !== undefined) {
      updateValues.name = dto.name;
    }

    await this.update(id, updateValues);
    return this.findById(id);
  }

  async deleteCity(id: number): Promise<boolean> {
    const result = await this.delete(id);
    return Boolean(result.affected);
  }
}