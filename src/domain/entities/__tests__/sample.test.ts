describe('Sample Test', () => {
  it('should pass', () => {
    expect(1 + 1).toBe(2);
  });
  
  it('should handle basic math', () => {
    expect(5 * 5).toBe(25);
    expect(10 / 2).toBe(5);
  });
  
  it('should work with strings', () => {
    expect('hello' + ' world').toBe('hello world');
  });
});
