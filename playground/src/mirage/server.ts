import { createServer, Model, Response } from 'miragejs';
import type { Form } from 'react-rule-based-renderer/types';
import { seedForm } from './seeds/form';

export function makeServer({ environment = 'development' } = {}) {
  const server = createServer({
    environment,

    models: {
      form: Model.extend<Partial<Form>>({}),
    },

    seeds(server) {
      seedForm(server)
    },

    routes() {
      this.namespace = 'api';

      this.get('/forms', (schema) => {
        return schema.all('form');
      });

      this.get('/forms/:id', (schema, request) => {
        const id = request.params.id;
        const form = schema.find('form', id);

        if (!form) {
          return new Response(404, {}, { error: 'Form not found' });
        }

        return form;
      });

      this.post('/forms', (schema, request) => {
        const attrs = JSON.parse(request.requestBody);

        if (!attrs.name) {
          return new Response(400, {}, { error: 'Form name is required' });
        }

        if (!attrs.elements) {
          return new Response(400, {}, { error: 'Form elements are required' });
        }

        if (!attrs.id) {
          attrs.id = `form-${Date.now()}`;
        }

        return schema.create('form', attrs);
      });

      this.put('/forms/:id', (schema, request) => {
        const id = request.params.id;
        const attrs = JSON.parse(request.requestBody);

        const form = schema.find('form', id);

        if (!form) {
          return new Response(404, {}, { error: 'Form not found' });
        }

        if (!attrs.name) {
          return new Response(400, {}, { error: 'Form name is required' });
        }

        if (!attrs.elements) {
          return new Response(400, {}, { error: 'Form elements are required' });
        }

        form.update(attrs);
        return form;
      });

      this.delete('/forms/:id', (schema, request) => {
        const id = request.params.id;
        const form = schema.find('form', id);

        if (!form) {
          return new Response(404, {}, { error: 'Form not found' });
        }

        form.destroy();
        return new Response(204);
      });

    },
  });

  return server;
}
