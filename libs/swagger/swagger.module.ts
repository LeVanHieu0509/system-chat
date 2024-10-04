import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export class SwaggerSetup {
  static setup(app: INestApplication): void {
    const config = new DocumentBuilder()
      .setTitle('BITBACK API Documentation')
      .setDescription('API documentation for the BITBACK system')
      .setVersion('1.0')
      .build();

    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup('swagger', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
      customCss: `
        .swagger-ui .wrapper {
          width: 100%;
          max-width: 1460px;
          margin: 0 auto;
          padding: 0 20px;
        }
        .swagger-ui .opblock-tag-section {
          display: flex;
          flex-direction: column;
        }
        .swagger-ui .opblock-tag {
          font-size: 24px;
          margin: 0 0 5px;
          font-family: Titillium Web, sans-serif;
          color: #3b4151;
        }
        .swagger-ui .opblock.opblock-post {
          border-color: #49cc90;
          background: rgba(73, 204, 144, .1);
        }
        .swagger-ui .opblock {
          margin: 0 0 15px;
          border: 1px solid #000;
          border-radius: 4px;
          box-shadow: 0 0 3px rgba(0, 0, 0, .19);
        }
        .swagger-ui .opblock.opblock-post .opblock-summary {
          border-color: #49cc90;
        }
        .swagger-ui .opblock.opblock-get .opblock-summary {
          border-color: #61affe;
        }
        .swagger-ui .opblock.opblock-post .arrow,
        .swagger-ui .opblock.opblock-get .arrow {
          display: none;
        }
        .swagger-ui .opblock.opblock-post .opblock-summary-method {
          background: #49cc90;
        }
        .swagger-ui .opblock .opblock-summary-description {
          font-size: 13px;
          flex: 1;
          font-family: Open Sans, sans-serif;
          color: #3b4151;
        }
        .swagger-ui .tab {
          display: flex;
          margin: 20px 0 10px;
          padding: 0;
          list-style: none;
        }
        .swagger-ui .tab li {
          font-size: 12px;
          min-width: 90px;
          padding: 0;
          cursor: pointer;
          font-family: Titillium Web, sans-serif;
          color: #3b4151;
        }
        .swagger-ui .tab li.active {
          font-weight: 700;
        }
        .swagger-ui .opblock-body pre {
          font-size: 12px;
          margin: 0;
          padding: 10px;
          white-space: pre-wrap;
          word-wrap: break-word;
          word-break: break-word;
          hyphens: auto;
          border-radius: 4px;
          background: #41444e;
          font-family: Source Code Pro, monospace;
          font-weight: 600;
          color: #fff;
        }
        .swagger-ui select {
          font-size: 14px;
          font-weight: 700;
          padding: 5px 40px 5px 10px;
          border: 2px solid #41444e;
          border-radius: 4px;
          background: #f7f7f7;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, .25);
          font-family: Titillium Web, sans-serif;
          color: #3b4151;
          appearance: none;
        }
        .swagger-ui .responses-inner {
          padding: 20px;
        }
        .swagger-ui table {
          width: 100%;
          padding: 0 10px;
          border-collapse: collapse;
        }
        .swagger-ui table tbody tr td:first-of-type {
          max-width: 50%;
          min-width: 10em;
          padding: 10px 0;
        }
        .swagger-ui .response-col_status {
          font-size: 14px;
          font-family: Open Sans, sans-serif;
          color: #3b4151;
          font-weight: 700;
        }
        .swagger-ui table tbody tr td {
          padding: 10px 0 0;
          vertical-align: top;
        }
        .swagger-ui .response-col_description__inner div.markdown,
        .swagger-ui .response-col_description__inner div.renderedMarkdown {
          font-size: 12px;
          font-style: italic;
          display: block;
          margin: 0;
          padding: 10px;
          border-radius: 4px;
          background: #41444e;
          font-family: Source Code Pro, monospace;
          font-weight: 600;
          color: #fff;
        }
        .swagger-ui .model-box-control:focus,
        .swagger-ui .models-control:focus,
        .swagger-ui .opblock-summary-control:focus {
          outline: none;
        }
      `,
      customSiteTitle: 'LAS API Documentation',
    });
  }
}
