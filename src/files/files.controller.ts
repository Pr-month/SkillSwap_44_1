import { Controller, Post, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, PayloadTooLargeException, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from "path";

@Controller('files')
export class FilesController {
  @Post()
  // настраиваем перехватчик запроса
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        // записываем куда сохраняем
        destination: './public/uploads',
        filename: (req, file, callback) => {
          // генерируем уникальное префикс для имени
          const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          // записываем расширение файла вместе с точкой
          const ext = extname(file.originalname);
          // составляем уникальное имя
          const uniqueName = `${uniquePrefix}${ext}`;

          console.log("имя файла: " + uniqueName);

          // передаем сгенерированное имя обратно в multer чтобы он использовал наше имя
          callback(null, uniqueName);
        },
      }),

      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/^image\/(jpeg|png|webp)$/)) {
          return callback(
            new BadRequestException('Разрешены только jpg, jpeg, png, webp'),
            false,
          );
        }

        callback(null, true);
      },
    }),
  )
  uploadFiles(
    @UploadedFile(
      new ParseFilePipe({
        // описываем валидацию по тз
        validators: [
          // ограничиваем размер 2мб
          new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 }),
        ],

        // при превышении размера выкидываем ошибку 413
        exceptionFactory: (errorString) => {
          return new PayloadTooLargeException(errorString);
        },
      }),
    )
    // метод uploadFiles принимает в параметр файл
    file: Express.Multer.File,
  ) {

    console.log(file);
    // формируем публичную ссылку
    const publicUrl = `http://localhost:3000/public/uploads/${file.filename}`

    // возвращаем ссылку в ответе
    return { url: publicUrl };
  }
}
