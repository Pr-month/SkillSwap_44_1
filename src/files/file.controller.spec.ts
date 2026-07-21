import { Test, TestingModule } from '@nestjs/testing'
import { FilesController } from './files.controller'

describe('Files controller', () => {
    // объявляем контроллер
    let controller: FilesController;

    // перед каждым тестом создаем новый модуль 
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({ controllers: [FilesController] }).compile();

        // извлекаем контроллер и записываем его в переменную
        controller = module.get<FilesController>(FilesController)
    });

    // проверяем что контроллер определен
    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    // проверяем что возвращается корректный публичный url
    it('should return uploaded file public URL', () => {
        // объект загружаемого файла
        const file = { filename: 'avatar.png' } as Express.Multer.File;

        // проверяем что метод uploadFiles возвращает корректное имя
        expect(controller.uploadFiles(file)).toEqual({
            url: 'http://localhost:3000/public/uploads/avatar.png'
        });
    })
})