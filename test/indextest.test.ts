import * as fs from 'fs';
import * as path from 'path';

it.skip('should match the snapshot of index.html', () => {
    const filePath = path.resolve(__dirname, '../dist/index.html');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    expect(fileContent).toMatchSnapshot();
});