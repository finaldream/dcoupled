import path from 'path';
import { Renderer } from './renderer';
import { Site } from '../site/site';

describe('Renderer', () => {
    test('Initial should success with correct direction', () => {
        const rootPath = path.resolve('src/fixtures/config/');
        const site = new Site('default', rootPath);
        const render = new Renderer(site, require('decoupled-renderer-react'));
        expect(render).toHaveProperty('site');
    });
    test('Initial should fail with wrong direction', () => {
        try {
            const site = new Site('default', '');
            const render = new Renderer(site, require('decoupled-renderer-react'));    
        } catch (error) {
            expect(error.toString()).toMatch(/no such file or directory/ig);
        }
    });
})